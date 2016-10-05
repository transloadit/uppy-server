'use strict'

var Storage = require('../Storage')
var config = require('@purest/providers')

function * auth (next) {
  var provider = this.params.provider

  // if (!this.session[provider] || !this.session[provider].token) {
  //   console.log('error up here')
  //   this.body = 'theres an error up here'
  //   // handle error
  //   return
  // }

  var storage = new Storage({ provider: provider, config: config })
  var token = process.env.DRIVE_TOKEN

  yield new Promise((resolve, reject) => {
    storage.list({
      token: token
    }, (err, res, body) => {
      if (err) {
        // handle error
        this.status = 401
        this.body = {
          authed: false
        }
        return resolve()
      }
      resolve()
    })
  })
}

exports = module.exports = auth
