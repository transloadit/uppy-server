/**
 * oAuth callback.  Adds access token to session store
 * and redirects to redirect url.
 */
const atob = require('atob')

module.exports = function callback (req, res, next) {
  const providerName = req.params.providerName

  if (!req.session[providerName]) {
    req.session[providerName] = {}
  }

  req.session[providerName].token = req.query.access_token
  if (req.session.grant.state) {
    // TODO: confirm if the direct is one of uppy endpoints
    //    or just validate this redirect someway, since it's coming
    //    from the client.
    res.redirect(JSON.parse(atob(req.session.grant.state)).redirect)
  } else {
    next()
  }
}
