'use strict'

var utils = require('../utils')
var config = require('@purest/providers')

function * list (next) {
  var providerName = this.params.providerName
  var token = this.session[providerName].token

  var provider = utils.getProvider({ providerName, config })

  yield new Promise((resolve, reject) => {
    provider.list({
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
