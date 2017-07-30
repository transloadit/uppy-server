const atob = require('atob')
const qs = require('querystring')
const parseUrl = require('url').parse

module.exports = function oauthRedirect (req, res, next) {
  const query = Object.assign({}, req.query)
  const state = JSON.parse(atob(query.state))
  const handler = state.uppyInstance
  const handlerHostName = parseUrl(handler).host

  const isValidHost = req.uppyOptions.server.validHosts.some((url) => {
    return handlerHostName === url || (new RegExp(url)).test(handlerHostName)
  })

  if (isValidHost) {
    const providerName = req.uppyProvider.authProvider
    const params = qs.stringify(query)
    const url = `${handler}/connect/${providerName}/callback?${params}`
    return res.redirect(url)
  }

  next(new Error('Invalid Host in state'))
}
