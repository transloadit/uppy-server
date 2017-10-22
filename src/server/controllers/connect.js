const atob = require('atob')
const qs = require('querystring')

// initializes the oAuth flow for a provider.
module.exports = function connect (req, res, next) {
  const query = Object.assign({}, req.query)
  const { path } = req.uppyOptions.server

  if (req.uppyOptions.server.oauthDomain) {
    let newState = query.state ? JSON.parse(atob(query.state)) : {}
    const { host, protocol } = req.uppyOptions.server
    newState.uppyInstance = `${protocol}://${host}${path}`
    query.state = Buffer.from(JSON.stringify(newState)).toString('base64')
  }

  res.redirect(`${path}/connect/${req.uppyProvider.authProvider}?${qs.stringify(query)}`)
}
