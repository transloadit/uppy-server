'use strict'

var Storage = require('../Storage')
var config = require('@purest/providers')

function * list (next) {
  if (!this.session || !this.request || !this.request.body || !this.params.provider) {
    // throw error
  }

  var provider = this.params.provider
  var token = this.session[provider].token

  var storage = new Storage({ provider: provider, config: config })

  yield storage.list({
    token: token
  }, (err, res, body) => {
    if (err) { 
      // throw error 
    }

    self.body = body
  })
}

exports = module.exports = list
