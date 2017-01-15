'use strict'

function logout (req, res) {
  var session = req.session
  var providerName = req.params.providerName

  if (session[providerName]) {
    session[providerName].token = null
  }

  if (session.grant) {
    session.grant.state = null
    session.grant.dynamic = null
  }
  res.json({ok: true})
}

exports = module.exports = logout
