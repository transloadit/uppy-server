// @ts-ignore
const atob = require('atob')
const qs = require('querystring')
const parseUrl = require('url').parse
const { hasMatch } = require('../utils')

/**
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
module.exports = function oauthRedirect (req, res, next) {
  const query = Object.assign({}, req.query)
  const state = JSON.parse(atob(query.state))
  const handler = state.uppyInstance
  const handlerHostName = parseUrl(handler).host

  if (hasMatch(handlerHostName, req.uppy.options.server.validHosts)) {
    const providerName = req.uppy.provider.authProvider
    const params = qs.stringify(query)
    const url = `${handler}/connect/${providerName}/callback?${params}`
    return res.redirect(url)
  }

  res.status(400).send('Invalid Host in state')
}
