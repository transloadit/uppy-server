const utils = require('../utils')
const config = require('@purest/providers')

function list ({ params, session }, res, next) {
  const providerName = params.providerName
  const token = session[providerName].token

  const provider = utils.getProvider({ providerName, config })

  provider.list({ token, directory: params.id }, (err, resp, body) => {
    if (err) {
      return next(err)
    }
    return res.json(body)
  })
}

exports = module.exports = list
