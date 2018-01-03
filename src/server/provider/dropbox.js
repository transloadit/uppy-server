const request = require('request')
const purest = require('purest')({ request })

/**
 *
 */
class DropBox {
  constructor (options) {
    this.authProvider = options.provider = DropBox.authProvider
    this.client = purest(options)
  }

  static get authProvider () {
    return 'dropbox'
  }

  /**
   *
   * @param {object} options
   * @param {function} done
   */
  list (options, done) {
    return this.stats(options, done)
  }

  stats ({ directory, query, token }, done) {
    this.client
      .post('files/list_folder')
      .options({version: '2'})
      .where(query)
      .auth(token)
      .json({
        path: `${directory || ''}`,
        include_media_info: true
      })
      .request(done)
  }

  download ({ id, token }, onData) {
    return this.client
      .post('https://content.dropboxapi.com/2/files/download')
      .options({
        version: '2',
        headers: {
          'Dropbox-API-Arg': JSON.stringify({path: `${id}`})
        }
      })
      .auth(token)
      .request()
      .on('data', onData)
      .on('error', (err) => {
        console.log('there was an error:', err)
      })
  }

  thumbnail ({id, token}, done) {
    return this.client
      .post('https://content.dropboxapi.com/2/files/get_thumbnail')
      .options({
        version: '2',
        headers: {
          'Dropbox-API-Arg': JSON.stringify({path: `${id}`})
        }
      })
      .auth(token)
      .request()
      .on('response', done)
      .on('error', (err) => {
        console.log('there was an error:', err)
      })
  }
}

module.exports = DropBox
