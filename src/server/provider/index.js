const config = require('@purest/providers')
const dropbox = require('./dropbox')
const drive = require('./drive')
const instagram = require('./instagram')

module.exports.getProviderMiddleware = (providers) => {
  return (req, res, next, providerName) => {
    if (providers[providerName]) {
      req.uppyProvider = new providers[providerName]({ providerName, config })
    }
    next()
  }
}

module.exports.getDefaultProviders = () => {
  return { dropbox, drive, instagram }
}

module.exports.addCustomProviders = (customProviders, providers, grantConfig) => {
  Object.keys(customProviders).forEach((providerName) => {
    providers[providerName] = customProviders[providerName].module
    grantConfig[providerName] = customProviders[providerName].config
  })
}

module.exports.addProviderOptions = (options, grantConfig) => {
  const keys = Object.keys(options).filter((key) => key !== 'server')
  keys.forEach((providerName) => {
    if (grantConfig[providerName]) {
      // explicitly add options so users don't override other options.
      grantConfig[providerName].key = options[providerName].key
      grantConfig[providerName].secret = options[providerName].secret
    }
  })
}
