'use strict'

var utils = require('../utils')
var config = require('@purest/providers')
var Uploader = require('../Uploader')

function * get (next) {
  var providerName = this.params.providerName
  var id = this.params.id
  var body = this.request.body
  var endpoint = body.endpoint
  var protocol = body.protocol
  var token = this.session[providerName] ? this.session[providerName].token : body.token

  // config for keys and stuff somewhere here, maybe

  var provider = utils.getProvider({ providerName, config })
  var uploader = new Uploader({
    endpoint: endpoint,
    protocol: protocol
  })

  yield new Promise((resolve, reject) => {
    uploader.on('finish', (data) => {
      // add response data (body, status, etc) to 'this' context
      resolve(Object.assign(this, data))
    })

    provider.download({ id, token })
      .then((response) => {
        response.pipe(uploader.upload({ path: process.env.UPPYSERVER_DATADIR + '/' + encodeURIComponent(id) }))
      })
  })
}

exports = module.exports = get
