var request = require('request')
var config = require('../../../config/auth')

var protocol = config.server.protocol
var host = config.server.host

module.exports = function *(next) {
  if (!this.session.tokens) {
    this.session.tokens = {}
  }

  request.post({
    url: config.tokenURI,
    json: true,
    qs: {
      code: this.query.code,
      grant_type: 'authorization_code',
      client_id: config.dropbox.clientKey,
      client_secret: config.dropbox.clientSecret,
      redirect_uri: protocol + host + config.dropbox.callback
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

    this.session.tokens.dropbox = body.access_token
  })
}
