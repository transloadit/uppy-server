var fs = require('fs')
var google = require('googleapis')
var GoogleAuth = require('google-auth-library')
var config = require('../../../config/auth')

var clientKey = config.drive.key
var clientSecret = config.drive.secret
var redirectUrl = config.server.url + config.drive.callback

module.exports = function () {
  return function *(next) {
    var service = google.drive('v2')
    var auth = new GoogleAuth()

    var oauth2Client = new auth.OAuth2(clientKey, clientSecret, redirectUrl)
    oauth2Client.credentials = this.session.drive.token

    yield function getFile (cb) {
      service.files.get({
        fileId: this.query.fileId,
        auth  : auth,
        alt   : 'media'
      }, function (error, file) {
        if (error) {
          this.body = error
          return cb()
        }
        fs.writeFile('files/' + this.query.fileId, file, function (err, res) {
          if (err) {
            this.body = err
          }

          this.status = 200
          cb()
        })
      })
    }
  }
}
