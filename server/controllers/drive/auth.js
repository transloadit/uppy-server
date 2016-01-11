var google = require('googleapis')
var googleAuth = require('google-auth-library')
var config = require('../../../config/auth')
var callback = config.server.protocol + '://' + config.server.host  + config.drive.callback

module.exports = { 
  authorize: function* (next) {
    if (!this.session.drive) {
      this.session.drive = {}
    }

    if (!this.session.drive.auth || !this.session.drive.client) {
      var auth = new googleAuth()
      var client = new auth.OAuth2(config.drive.key, config.drive.secret, callback)

      this.session.drive.auth = auth
      this.session.drive.client = oauth2Client
    }

    if (!this.session.drive.token) {
      this.redirect(this.getAuthUrl())
    } else {
      this.session.drive.client.credentials = this.session.drive.token
    }
  },
  getToken: function *(next) {
    oauth2Client.getToken(this.query.code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err)
        return
      }
      oauth2Client.credentials = token
      this.session.drive.token = token
      this.redirect('/')
    })
  },
  getAuthUrl: function* getAuthUrl(next) {
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });

    this.body = authUrl;
  }
}
