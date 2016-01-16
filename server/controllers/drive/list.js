var google = require('googleapis')
var googleAuth = require('google-auth-library')
var config = require('../../../config/auth')

var clientKey = config.drive.key
var clientSecret = config.drive.secret
var redirectUrl = config.server.url + config.drive.callback

module.exports = function () {
  return function *(next) {
    var service = google.drive('v2')
    var auth = new googleAuth()

    var oauth2Client = new auth.OAuth2(clientKey, clientSecret, redirectUrl)
    oauth2Client.credentials = this.session.drive.token

    var query = "'" + (this.query.dir || "root") + "' in parents"

    yield function listFiles(cb) {
      service.files.list({
        auth: auth,
        nextToken: this.query.nextToken || '',
        q: query
      }, function(err, res) {
        if (err) {
          this.body = err
          return cb()
        }
        this.body = res.items
        cb()
      })
    }
  }
}
