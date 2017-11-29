const tokenService = require('../token-service')

function logout (req, res) {
  const session = req.session
  const providerName = req.params.providerName

  if (req.uppy.providerTokens[providerName]) {
    delete req.uppy.providerTokens[providerName]
    tokenService.setToken(res, tokenService.generateToken(req.uppy.providerTokens, req.uppy.options.secret))
  }

  if (session.grant) {
    session.grant.state = null
    session.grant.dynamic = null
  }
  res.json({ ok: true })
}

exports = module.exports = logout
