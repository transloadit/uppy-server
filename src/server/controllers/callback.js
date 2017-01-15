/**
 * oAuth callback.  Adds access token to session store
 * and redirects to original page.
 * Eventually refactor to have `state` be entire Uppy state object.
 */
var atob = require('atob')

module.exports = function callback (req, res) {
  var providerName = req.params.providerName

  if (!req.session[providerName]) {
    req.session[providerName] = {}
  }

  req.session[providerName].token = req.query.access_token
  if (req.session.grant.state) {
    var state = JSON.parse(atob(req.session.grant.state))
    res.redirect(`${state.redirect}?state=${req.session.grant.state}`)
  } else {
    res.redirect(process.env.UPPY_ENDPOINT)
  }
}
