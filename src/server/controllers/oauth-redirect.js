const atob = require('atob')
const qs = require('querystring')

module.exports = function oauthRedirect (req, res, next) {
  const query = Object.assign({}, req.query)
  const state = JSON.parse(atob(query.state))
  const handler = state.uppyInstance

  // do some validation here. don't just redirect to any url
  res.redirect(`${handler}/connect/${req.uppyProvider.provider}/callback?${qs.stringify(query)}`)
}
