var googleAuth = require('google-auth-library')
var config = require('../../../config/auth')

var clientKey = config.drive.key
var clientSecret = config.drive.secret
var redirectUrl = config.server.url + config.drive.callback

var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']

module.exports = {
  authorize() {
    return function* (next) {
      if (!this.session.drive) {
        this.session.drive = {}
      }
      var auth = new googleAuth()
      var client = new auth.OAuth2(clientKey, clientSecret, redirectUrl)

      if (!this.session.drive.token) {
        var authUrl = client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES
        })

        this.redirect(authUrl)
      } else {
        this.session.drive.client.credentials = this.session.drive.token
      }
    }
  },
  getToken() {
    return function* (next) {
      var auth = new googleAuth()
      var client = new auth.OAuth2(config.drive.key, config.drive.secret, callback)

      yield function fetchToken(cb) {
        client.getToken(this.query.code, function tokenCallback(err, token) {
          if (err) {
            console.log('Error while trying to retrieve access token', err)
            return
          }

          this.session.drive.token = token
          cb()
        }.bind(this))
      }

      this.redirect('/')
    }
  }
}
