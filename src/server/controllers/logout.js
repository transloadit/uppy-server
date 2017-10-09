const tokenService = require('../token-service')

function logout (req, res) {
  const session = req.session
  const providerName = req.params.providerName

  if (req.uppyProviderTokens[providerName]) {
    delete req.uppyProviderTokens[providerName]
    tokenService.setToken(res, tokenService.generateToken(req.uppyProviderTokens, req.uppyOptions.secret))
  }

  if (session.grant) {
    session.grant.state = null
    session.grant.dynamic = null
  }
  res.json({ ok: true })
}

exports = module.exports = logout
