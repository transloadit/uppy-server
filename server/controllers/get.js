'use strict'

var Storage = require('../Storage')
var config = require('@purest/providers')
var Uploader = require('../Uploader')

function * get (next) {
  if (!this.params.id) {
    // handle no id error
    return yield next
  }

  var provider = this.params.provider
  var id = this.params.id
  var body = this.request.body
  var endpoint = 'api2.transloadit.com'
  var protocol = 'whatever'
  var token = this.session[provider] ? this.session[provider].token : body.token

  // config for keys and stuff somewhere here, maybe

  var storage = new Storage({ provider, config })
  var uploader = new Uploader({
    endpoint: endpoint,
    protocol: protocol
  })

  yield new Promise((resolve, reject) => {
    uploader.on('finish', (data) => {
      // add response data (body, status, etc) to 'this' context
      resolve(Object.assign(this, data))
    })

    storage.download({ id, token })
      .then((response) => {
        response.pipe(uploader.upload({ path: './data/' + id }))
      })
  })
}

exports = module.exports = get
