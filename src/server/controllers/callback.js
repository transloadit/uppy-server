/**
 * oAuth callback.  Encripts the access token and sends the new token with the response,
 * and redirects to redirect url.
 */
// @ts-ignore
const atob = require('atob')
const tokenService = require('../token-service')

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
    // TODO: confirm if the direct is one of uppy endpoints
    //    or just validate this redirect someway, since it's coming
    //    from the client.
    res.redirect(JSON.parse(atob(req.session.grant.state)).redirect)
  } else {
    next()
  }
}
