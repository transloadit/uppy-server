const utils = require('../utils')
const config = require('@purest/providers')

function auth ({ params, session }, res) {
  const providerName = params.providerName

  if (!session[providerName] || !session[providerName].token) {
    return res.json({ authenticated: false })
  }

  const provider = utils.getProvider({ providerName, config })
  const token = session[providerName].token

  provider.list({ token }, (err, response, body) => {
    const notAuthenticated = Boolean(err)
    return res.json({ authenticated: !notAuthenticated })
  })
}

exports = module.exports = auth
