const atob = require('atob')
const qs = require('querystring')

module.exports = function connect (req, res, next) {
  const query = Object.assign({}, req.query)

  if (req.uppyOptions.oauthDomain) {
    let newState = query.state ? JSON.parse(atob(query.state)) : {}
    const { host, protocol } = req.uppyOptions.server
    newState.uppyInstance = `${protocol}://${host}`
    query.state = Buffer.from(JSON.stringify(newState)).toString('base64')
  }

  res.redirect(`/connect/${req.uppyProvider.authProvider}?${qs.stringify(query)}`)
}
