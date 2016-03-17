var Dropbox = require('dropbox')
var config = require('../../../config/auth')
var callback = config.server.protocol + '://' + config.server.host + config.dropbox.callback

module.exports = function () {
  return function *(next) {
    if (!this.session.dropbox) {
      this.session.dropbox = {}
    }

    // @todo Lint says: "request" is not defined. Adding this but will obviously break.
    // How do you want to resolve @hedgerh?
    const request = {}
    request.post({
      url : config.dropbox.tokenURI,
      json: true,
      qs  : {
        code         : this.query.code,
        grant_type   : 'authorization_code',
        client_id    : config.dropbox.clientKey,
        client_secret: config.dropbox.clientSecret,
        redirect_uri : callback
      },
      headers: [
        {
          name : 'content-type',
          value: 'application/json'
        }
      ]
    }, (err, res, body) => {
      if (err) {
        return console.log(err)
      }

      var client = new Dropbox.Client({
        key   : config.dropbox.key,
        secret: config.dropbox.secret
      })
      console.dir(client)

      this.session.dropbox.token = body.access_token
    })
  }
}
