/**
 * oAuth callback.  Adds access token to session store
 * and redirects to redirect url.
 */
const atob = require('atob')

module.exports = function callback (req, res) {
  const providerName = req.params.providerName

  if (!req.session[providerName]) {
    req.session[providerName] = {}
  }

  req.session[providerName].token = req.query.access_token
  if (req.session.grant.state) {
    res.redirect(JSON.parse(atob(req.session.grant.state)).redirect)
  } else {
    res.redirect(process.env.UPPY_ENDPOINT)
  }
}
