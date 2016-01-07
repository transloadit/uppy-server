var request = require('request')
var auth = require('../../config/auth')

module.exports = function (opts) {
  return function *(next) {
    this.redirect('')
  }
}
