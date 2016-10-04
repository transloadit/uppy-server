var fs = require('fs')
var path = require('path')
var request = require('request')
var purest = require('purest')({ request: request })
var mime = require('mime-types').lookup

function Drive (options) {
  options.provider = 'google'
  options.alias = 'drive'

  this.client = purest(options)
}

Drive.prototype.list = function (options, done) {
  return this.client.query()
    .get('files')
    .auth(options.token)
    .request(done)
}

Drive.prototype.stats = function (options, done) {
  return this.client.query()
    .get('files/' + options.id)
    .auth(options.token)
    .request()
}

Drive.prototype.upload = function (options, done) {
  return this.client.query('upload-drive')
    .update('files')
    .where({uploadType:'multipart'})
    .upload([
      {
        'Content-Type':'application/json',
        body:JSON.stringify({title:path.basename(options.path)})
      },
      {
        'Content-Type':mime(path.extname(options.path)),
        body:options.body||fs.createReadStream(options.path)
      }
    ])
    .auth(options.token)
    .request(done)
}

Drive.prototype.download = function (options, done) {
  return this.client.query()
    .get('files/' + options.id)
    .where({alt: 'media'})
    .auth(options.token)
    .request(done)
}

exports = module.exports = Drive
