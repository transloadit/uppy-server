const utils = require('../utils')
const config = require('@purest/providers')

function thumbnail (req, res) {
  const providerName = req.params.providerName
  const id = req.params.id
  const body = req.body
  const token = req.session[providerName]
    ? req.session[providerName].token
    : body.token
  const provider = utils.getProvider({ providerName, config })

  provider.thumbnail({ id, token }, (response) => response ? response.pipe(res) : res.sendStatus(404))
}

exports = module.exports = thumbnail
