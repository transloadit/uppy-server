const request = require('request')
const purest = require('purest')({ request })

class Instagram {
  constructor (options) {
    options.provider = 'instagram'
    this.client = purest(options)
  }

  list ({ directory = 'recent', token, query = {} }, done) {
    const qs = query.max_id ? {max_id: query.max_id} : {}
    this.client
      .select(`users/self/media/${directory}`)
      .qs(qs)
      .auth(token)
      .request(done)
  }

  download ({ id, token }, onData, onResponse) {
    return this.client
      .get(`media/${id}`)
      .auth(token)
      .request((err, resp, body) => {
        if (err) return console.log('there was an error:', err)

        request(body.data[`${body.data.type}s`].standard_resolution.url)
          .on('response', onResponse)
          .on('error', (err) => {
            console.log('there was an error:', err)
          })
      })
  }

  thumbnail ({id, token}, done) {
    return this.client
      .get(`media/${id}`)
      .auth(token)
      .request((err, resp, body) => {
        if (err) return console.log('there was an error:', err)

        request(body.data.images.thumbnail.url)
          .on('response', done)
          .on('error', (err) => {
            console.log('there was an error:', err)
          })
      })
  }
}

exports = module.exports = Instagram
