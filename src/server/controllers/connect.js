// @ts-ignore
const atob = require('atob')
const qs = require('querystring')

/**
 * initializes the oAuth flow for a provider.
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
module.exports = function connect (req, res, next) {
  const query = Object.assign({}, req.query)
  const { path } = req.uppy.options.server

  if (req.uppy.options.server.oauthDomain) {
    let newState = query.state ? JSON.parse(atob(query.state)) : {}
    const { host, protocol } = req.uppy.options.server
    newState.uppyInstance = `${protocol}://${host}${path}`
    query.state = Buffer.from(JSON.stringify(newState)).toString('base64')
  }

  res.redirect(`${path}/connect/${req.uppy.provider.authProvider}?${qs.stringify(query)}`)
}
