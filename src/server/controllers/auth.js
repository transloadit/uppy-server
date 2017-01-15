'use strict'

var utils = require('../utils')
var config = require('@purest/providers')

function auth (req, res) {
  var providerName = req.params.providerName

  if (!req.session[providerName] || !req.session[providerName].token) {
    return res.json({ authenticated: false })
  }

  var provider = utils.getProvider({ providerName, config })
  var token = req.session[providerName].token

  provider.list({token: token}, (err, response, body) => {
    var notAuthenticated = Boolean(err)
    return res.json({ authenticated: !notAuthenticated })
  })
}

exports = module.exports = auth
