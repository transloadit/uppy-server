var request = require('request');
var auth = require('../../config/auth-config')

module.exports = function (provider) {
  return function *(next) {
    if (!this.session.tokens) {
      this.session.tokens = {}
    }

    request.post({
      url: auth[provider].tokenURI,
      json: true,
      qs: {
        code: this.query.code,
        grant_type: 'authorization_code',
        client_id: auth[provider].clientKey,
        client_secret: auth[provider].clientSecret,
        redirect_uri: 'http://localhost:3000/dropbox/callback'
      },
      headers: [
        {
          name: 'content-type',
          value: 'application/json'
        }
      ]
    }, (err, res, body) => {
      if (err) {
        return console.log(err)
      }

      this.session.tokens[provider] = body.access_token
    })
  }
}
