var fs = require('fs')
var path = require('path')
var request = require('request')
var purest = require('purest')

function DropBox (options) {
  options.provider = 'dropbox'

  this.client = purest(Object.assign({}, options, { request }))
}

DropBox.prototype.list = function (options, done) {
  return this.stats(options, done)
}

DropBox.prototype.stats = function (options, done) {
  this.client.query()
    .select('metadata/auto' + options.id)
    .where(options.query)
    .auth(options.token)
    .request(done)
}

DropBox.prototype.upload = function (options, done) {
  var name = options.name || path.basename(options.path)

  var request = this.client.query('files')
    .put('files_put/auto/' + name)
    .auth(options.token)
    .request(done)

  return (options.name)
    ? request
    : fs.createReadStream(options.path).pipe(request)
}

DropBox.prototype.download = function (options, done) {
  return this.client.query('files')
    .get('files/auto/' + options.id)
    .auth(options.token)
    .request(done)
}

exports = module.exports = DropBox
