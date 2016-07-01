'use strict'

var Purest = require('../../../')

function Box (options) {
  this.client = new Purest(options)
}

Box.prototype.list = function (options, done) {
  return this.client.query()
    .select('folders/' + options.id + '/items')
    .auth(options.token)
    .request(done)
}

Box.prototype.stats = function (options, done) {
  var api = (options.type === 'file') ? 'files' : 'folders'
  return this.client.query()
    .select(api + '/' + options.id)
    .auth(options.token)
    .request(done)
}

Box.prototype.download = function (options, done) {
  return this.client.query()
    .get('files/' + options.id + '/content')
    .auth(options.token)
    .request(done)
}

exports = module.exports = Box
