'use strict'

var utils = require('../utils')
var config = require('@purest/providers')

function list (req, res, next) {
  var providerName = req.params.providerName
  var token = req.session[providerName].token

  var provider = utils.getProvider({ providerName, config })

  provider.list({ token, directory: req.params.id }, (err, resp, body) => {
    if (err) {
      return next(err)
    }
    return res.json(body)
  })
}

exports = module.exports = list
