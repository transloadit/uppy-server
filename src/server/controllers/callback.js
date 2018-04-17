/**
 * oAuth callback.  Encripts the access token and sends the new token with the response,
 * and redirects to redirect url.
 */
// @ts-ignore
const atob = require('atob')
const tokenService = require('../token-service')
const parseUrl = require('url').parse
const { hasMatch } = require('../utils')

/**
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
module.exports = function callback (req, res, next) {
  const providerName = req.params.providerName

  if (!req.uppy.providerTokens) {
    req.uppy.providerTokens = {}
  }

  req.uppy.providerTokens[providerName] = req.query.access_token
  req.uppy.debugLog(`Generating auth token for provider ${providerName}.`)
  const uppyAuthToken = tokenService.generateToken(req.uppy.providerTokens, req.uppy.options.secret)
  // add the token to the response
  tokenService.setToken(res, uppyAuthToken, req.uppy.options)

  if (req.session.grant.state) {
    const redirectUrl = JSON.parse(atob(req.session.grant.state)).redirect
    const allowedClients = req.uppy.options.clients
    const urlObj = parseUrl(redirectUrl)
    const urlWithProtocol = `${urlObj.protocol}//${urlObj.host}`
    // if no clients then allow any client
    if (!req.uppy.options.clients || hasMatch(urlWithProtocol, allowedClients) || hasMatch(urlObj.host, allowedClients)) {
      res.redirect(redirectUrl)
      return
    }
  }
  next()
}
