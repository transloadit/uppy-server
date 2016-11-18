'use strict'

var utils = require('../utils')
var config = require('@purest/providers')

function * auth (next) {
  var providerName = this.params.providerName

  if (!this.session[providerName] || !this.session[providerName].token) {
    this.body = { authenticated: false }
    // handle error
    return
  }

  var provider = utils.getProvider({ providerName, config })
  var token = this.session[providerName].token

  yield new Promise((resolve, reject) => {
    provider.list({
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
