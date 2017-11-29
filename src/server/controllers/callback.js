/**
 * oAuth callback.  Encripts the access token and sends the new token with the response,
 * and redirects to redirect url.
 */
const atob = require('atob')
const tokenService = require('../token-service')

module.exports = function callback (req, res, next) {
  const providerName = req.params.providerName

  if (!req.uppy.providerTokens) {
    req.uppy.providerTokens = {}
  }

  req.uppy.providerTokens[providerName] = req.query.access_token
  const uppyAuthToken = tokenService.generateToken(req.uppy.providerTokens, req.uppy.options.secret)
  // add the token to the response
  tokenService.setToken(res, uppyAuthToken)

  if (req.session.grant.state) {
    // TODO: confirm if the direct is one of uppy endpoints
    //    or just validate this redirect someway, since it's coming
    //    from the client.
    res.redirect(JSON.parse(atob(req.session.grant.state)).redirect)
  } else {
    next()
  }
}
