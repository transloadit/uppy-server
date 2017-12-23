const request = require('request')
// @ts-ignore
const purest = require('purest')({ request })

/**
 * @class
 * @implements {Provider}
 */
class Drive {
  constructor (options) {
    this.authProvider = options.provider = Drive.authProvider
    options.alias = 'drive'

    this.client = purest(options)
  }

  static get authProvider () {
    return 'google'
  }

  list (options, done) {
    const directory = options.directory || 'root'
    const trashed = options.trashed || false

    return this.client
      .query()
      .get('files')
      .where({ q: `'${directory}' in parents and trashed=${trashed}` })
      .auth(options.token)
      .request(done)
  }

  stats ({ id, token }, done) {
    return this.client.query().get(`files/${id}`).auth(token).request(done)
  }

  download ({ id, token }, onData) {
    return this.client
      .query()
      .get(`files/${id}`)
      .where({ alt: 'media' })
      .auth(token)
      .request()
      .on('data', onData)
      .on('error', (err) => {
        console.log('there was an error:', err)
      })
  }

  thumbnail ({id, token}, done) {
    return this.stats({id, token}, (err, resp, body) => {
      if (err) {
        console.log('there was an error:', err)
      }
      done(body.thumbnailLink ? request(body.thumbnailLink) : null)
    })
  }
}

module.exports = Drive
