'use strict'

var Storage = require('../Storage')
var config = require('@purest/providers')

function * auth (next) {
  var provider = this.params.provider

  if (!this.session[provider] || !this.session[provider].token) {
    this.body = { authenticated: false }
    // handle error
    return
  }

  var storage = new Storage({ provider: provider, config: config })
  var token = this.session[provider].token

  yield new Promise((resolve, reject) => {
    storage.list({
      token: token
    }, (err, res, body) => {
      if (err) {
        // handle error
        console.log(err)
        this.body = {
          authenticated: false
        }
        return resolve()
      }

      this.status = 200
      this.body = {
        authenticated: true
      }

      resolve()
    })
  })
}

exports = module.exports = auth
