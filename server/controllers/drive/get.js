var fs = require('fs')
var google = require('googleapis')
var GoogleAuth = require('google-auth-library')
var config = require('../../../config/auth')

var clientKey = config.drive.key
var clientSecret = config.drive.secret
var redirectUrl = config.server.url + config.drive.callback

module.exports = function () {
  return function * (next) {
    var service = google.drive('v2')
    var auth = new GoogleAuth()

    var oauth2Client = new auth.OAuth2(clientKey, clientSecret, redirectUrl)
    oauth2Client.credentials = this.session.drive.token
    var fileId = this.query.fileId || ''
    yield function getFile (cb) {
      service.files.get({
        fileId: fileId,
        auth: oauth2Client,
        alt: 'media'
      }, function (error, file) {
        if (error) {
          console.log(error)
          this.body = error
          return cb()
        }

        if (!fs.existsSync('files')) {
          fs.mkdirSync('files')
        }

        fs.writeFile('./files/tester.pdf', file, function (err, res) {
          if (err) {
            console.log(err)
            this.body = err
          }

          this.status = 200
          cb()
        })
      })
    }
  }
}
