var GoogleAuth = require('google-auth-library')
var config = require('../../../config/auth')

var clientKey = config.drive.key
var clientSecret = config.drive.secret
var redirectUrl = config.server.url + config.drive.callback

var SCOPES = ['https://www.googleapis.com/auth/drive']

module.exports = {
  authorize () {
    return function * (next) {
      if (!this.session.drive) {
        this.session.drive = {}
      }

      var auth = new GoogleAuth()
      var client = new auth.OAuth2(clientKey, clientSecret, redirectUrl)

      if (!this.session.drive.token) {
        var authUrl = client.generateAuthUrl({
          scope: SCOPES
        })

        this.body = {
          isAuthenticated: false,
          authUrl
        }
      } else {
        this.body = {
          isAuthenticated: true,
          authUrl: null
        }
      }
    }
  },
  getToken () {
    return function * (next) {
      var auth = new GoogleAuth()
      var client = new auth.OAuth2(clientKey, clientSecret, redirectUrl)

      yield function fetchToken (cb) {
        client.getToken(this.query.code, function tokenCallback (err, token) {
          if (err) {
            console.log('Error while trying to retrieve access token', err)
            return
          }

          this.session.drive.token = token
          cb()
        }.bind(this))
      }

      this.redirect(process.env.UPPY_ENDPOINT + '/examples/modal')
    }
  }
}
