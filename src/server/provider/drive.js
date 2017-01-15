var fs = require('fs')
var path = require('path')
var request = require('request')
var purest = require('purest')({ request })
var mime = require('mime-types').lookup

class Drive {
  constructor (options) {
    options.provider = 'google'
    options.alias = 'drive'

    this.client = purest(options)
  }

  list (options, done) {
    var directory = options.directory || 'root'
    var trashed = options.trashed || false

    return this.client.query()
      .get('files')
      .where({ q: `'${directory}' in parents and trashed=${trashed}` })
      .auth(options.token)
      .request(done)
  }

  stats (options, done) {
    return this.client.query()
      .get('files/' + options.id)
      .auth(options.token)
      .request()
  }

  upload (options, done) {
    return this.client.query('upload-drive')
      .update('files')
      .where({uploadType: 'multipart'})
      .upload([
        {
          'Content-Type': 'application/json',
          body: JSON.stringify({ title: path.basename(options.path) })
        },
        {
          'Content-Type': mime(path.extname(options.path)),
          body: options.body || fs.createReadStream(options.path)
        }
      ])
      .auth(options.token)
      .request(done)
  }

  download (options) {
    return new Promise((resolve, reject) => {
      this.client.query()
        .get('files/' + options.id)
        .where({ alt: 'media' })
        .auth(options.token)
        .request()
        .on('response', (response) => {
          response.pause()
          resolve(response)
        })
        .on('error', (err) => {
          console.log('there was an error:', err)
        })
    })
  }
}

exports = module.exports = Drive
