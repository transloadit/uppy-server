const config = require('@purest/providers')
const dropbox = require('./dropbox')
const drive = require('./drive')

module.exports.getProviderMiddleware = (providers) => {
  return (req, res, next, providerName) => {
    if (providers[providerName]) {
      req.uppyProvider = new providers[providerName]({ providerName, config })
    }
    next()
  }
}

module.exports.getDefaultProviders = () => {
  return { dropbox, drive }
}

module.exports.addCustomProviders = (customProviders, providers, grantConfig) => {
  Object.keys(customProviders).forEach((providerName) => {
    providers[providerName] = customProviders[providerName].module
    grantConfig[providerName] = customProviders[providerName].config
  })
}
