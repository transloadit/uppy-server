'use strict'

var Storage = require('../Storage')
var config = require('@purest/providers')

function * list (next) {
  if (!this.session || !this.request || !this.request.body || !this.params.provider) {
    // throw error
  }

  if (!this.params.id) {
    // throw error
  }

  var provider = this.params.provider
  var token = this.session[provider].token

  var storage = new Storage({ provider: provider, config: config })

  yield new Promise((resolve, reject) => {
    storage.list({
      token: token,
      directory: this.params.id
    }, (err, res, body) => {
      if (err) {
        // throw error
      }

      this.body = body
      resolve()
    })
  })
}

exports = module.exports = list
