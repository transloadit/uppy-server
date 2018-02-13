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

  if (req.uppy.options.server.oauthDomain) {
    let newState = query.state ? JSON.parse(atob(query.state)) : {}
    newState.uppyInstance = req.uppy.buildURL('', true)
    query.state = Buffer.from(JSON.stringify(newState)).toString('base64')
  }

  res.redirect(req.uppy.buildURL(`/connect/${req.uppy.provider.authProvider}?${qs.stringify(query)}`, true))
}
