const fs = require('fs')
const path = require('path')
const request = require('request')
const purest = require('purest')({ request })

class DropBox {
  constructor (options) {
    options.provider = 'dropbox'
    this.client = purest(options)
  }

  list (options, done) {
    return this.stats(options, done)
  }

  stats ({ directory, query, token }, done) {
    this.client
      .query()
      .select(`metadata/auto/${directory || ''}`)
      .where(query)
      .auth(token)
      .request(done)
  }

  upload (options, done) {
    const name = options.name || path.basename(options.path)

    const request = this.client
      .query('files')
      .put(`files_put/auto/${name}`)
      .auth(options.token)
      .request(done)

    return options.name
      ? request
      : fs.createReadStream(options.path).pipe(request)
  }

  download ({ id, token }, onData) {
    return this.client
      .query('files')
      .get(`files/auto/${id}`)
      .auth(token)
      .request()
      .on('data', onData)
      .on('error', (err) => {
        console.log('there was an error:', err)
      })
  }
}

exports = module.exports = DropBox
