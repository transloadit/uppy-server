const config = require('@purest/providers')
const dropbox = require('./dropbox')
const drive = require('./drive')
const instagram = require('./instagram')

module.exports.getProviderMiddleware = (providers) => {
  // adds the desired provider module to the request object,
  // based on the providerName parameter specified.
  return (req, res, next, providerName) => {
    if (providers[providerName] && validOptions(req.uppyOptions)) {
      req.uppyProvider = new providers[providerName]({ providerName, config })
    } else {
      console.warn('uppy: Invalid provider options detected. Provider will not be loaded')
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

module.exports.addProviderOptions = ({ server, providerOptions }, grantConfig) => {
  if (!validOptions({ server, providerOptions })) {
    console.warn('uppy: Invalid provider options detected. Providers will not be loaded')
    return
  }

  grantConfig.server = {
    host: server.host,
    protocol: server.protocol,
    path: server.path
  }

  const { oauthDomain } = server
  const keys = Object.keys(providerOptions).filter((key) => key !== 'server')
  keys.forEach((providerName) => {
    if (grantConfig[providerName]) {
      // explicitly add providerOptions so users don't override other providerOptions.
      grantConfig[providerName].key = providerOptions[providerName].key
      grantConfig[providerName].secret = providerOptions[providerName].secret

      // override grant.js redirect uri with uppy's custom redirect url
      if (oauthDomain) {
        grantConfig[providerName].redirect_uri = `${server.protocol}://${oauthDomain}/${providerName}/redirect`
      }
    }
  })
}

const validOptions = ({ server, providerOptions }) => {
  return server.host && server.protocol
}
