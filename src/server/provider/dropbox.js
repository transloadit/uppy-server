var fs = require('fs')
var path = require('path')
var request = require('request')
var purest = require('purest')({ request })

class DropBox {
  constructor (options) {
    options.provider = 'dropbox'
    this.client = purest(options)
  }

  list (options, done) {
    return this.stats(options, done)
  }

  stats (options, done) {
    this.client.query()
      .select('metadata/auto/' + (options.directory || ''))
      .where(options.query)
      .auth(options.token)
      .request(done)
  }

  upload (options, done) {
    var name = options.name || path.basename(options.path)

    var request = this.client.query('files')
      .put('files_put/auto/' + name)
      .auth(options.token)
      .request(done)

    return (options.name)
      ? request
      : fs.createReadStream(options.path).pipe(request)
  }

  download (options, done) {
    return new Promise((resolve, reject) => {
      this.client.query('files')
        .get('files/auto/' + options.id)
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

exports = module.exports = DropBox
