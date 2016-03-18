// var request = require('request')
var config = require('../../config/auth')

var protocol = config.server.protocol
var host = config.server.host

module.exports = function (opts) {
  return function * (next) {
    this.redirect(config.dropbox.authURI + '?response_type=code&client_id=' + config.dropbox.key + '&redirect_uri=' + protocol + '://' + host + config.dropbox.callback)
  }
}
