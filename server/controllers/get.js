'use strict'

var Storage = require('../Storage')
var getUploader = require('../getUploader')
var config = require('@purest/providers')

function * get (next) {
  if (!this.session || !this.request || !this.request.body) {
    // throw error
  }

  var body = this.request.body
  var id = this.params.id
  var endpoint = body.endpoint
  var protocol = body.protocol
  var provider = body.provider
  var token = this.session[provider] ? this.session[provider].token : body.token

  if (!provider || !id) {
    // throw error
  }

  // config for keys and stuff somewhere here, maybe

  var storage = new Storage({ provider: this.params.provider, config: config })

  yield (cb) => {
    var req = storage.download({ 
      id, 
      token 
    }, (err, res, body) => {
      if (err) console.log(err)
      console.log(body)
    })

    var uploader = getUploader({
      path: './data/' + id,
      endpoint,
      protocol
    }, cb, this)

    req.pipe(uploader)
  }
}

exports = module.exports = get
