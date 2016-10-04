'use strict'

var Storage = require('../Storage')
var config = require('@purest/providers')

function * auth (next) {
  var provider = this.params.provider

  if (!this.session[provider] || !this.session[provider].token) {
    // handle error
  }

  var storage = new Storage({ provider: provider, config: config })
  var token = this.session[provider].token

  yield storage.list({
    token: token
  }, (err, res, body) => {
    if (err) { 
    // handle error 
    }

    // handle response
  })
}

exports = module.exports = auth
