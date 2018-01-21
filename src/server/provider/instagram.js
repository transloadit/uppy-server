const request = require('request')
const purest = require('purest')({ request })
const utils = require('../utils')

class Instagram {
  constructor (options) {
    this.authProvider = options.provider = Instagram.authProvider
    this.client = purest(options)
  }

  static get authProvider () {
    return 'instagram'
  }

  list ({ directory = 'recent', token, query = {} }, done) {
    const qs = query.max_id ? {max_id: query.max_id} : {}
    this.client
      .select(`users/self/media/${directory}`)
      .qs(qs)
      .auth(token)
      .request(done)
  }

  _getMediaUrl (body, carouselId) {
    let mediaObj
    let type

    if (body.data.type === 'carousel') {
      carouselId = carouselId ? parseInt(carouselId) : 0
      mediaObj = body.data.carousel_media[carouselId]
      type = mediaObj.type
    } else {
      mediaObj = body.data
      type = body.data.type
    }

    return mediaObj[`${type}s`].standard_resolution.url
  }

  download ({ id, token, query = {} }, onData) {
    return this.client
      .get(`media/${id}`)
      .auth(token)
      .request((err, resp, body) => {
        if (err) return console.error(err)
        request(this._getMediaUrl(body, query.carousel_id))
          .on('data', onData)
          .on('error', (err) => {
            console.error(err)
          })
      })
  }

  thumbnail ({id, token}, done) {
    return this.client
      .get(`media/${id}`)
      .auth(token)
      .request((err, resp, body) => {
        if (err) return console.error(err)

        request(body.data.images.thumbnail.url)
          .on('response', done)
          .on('error', (err) => {
            console.error(err)
          })
      })
  }

  size ({id, token, query = {}}, done) {
    return this.client
      .get(`media/${id}`)
      .auth(token)
      .request((err, resp, body) => {
        if (err) {
          console.error(err)
          return done()
        }

        utils.getURLMeta(this._getMediaUrl(body, query.carousel_id))
          .then(({ size }) => done(size))
          .catch((err) => {
            console.error(err)
            done()
          })
      })
  }
}

module.exports = Instagram
