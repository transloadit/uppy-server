const config = require('@purest/providers')
const dropbox = require('./dropbox')
const drive = require('./drive')
const instagram = require('./instagram')

module.exports.getProviderMiddleware = (providers) => {
  // adds the desired provider module to the request object,
  // based on the providerName parameter specified.
  return (req, res, next, providerName) => {
    if (providers[providerName] && validOptions(req.uppy.options)) {
      req.uppy.provider = new providers[providerName]({ providerName, config })
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
  keys.forEach((authProvider) => {
    if (grantConfig[authProvider]) {
      // explicitly add providerOptions so users don't override other providerOptions.
      grantConfig[authProvider].key = providerOptions[authProvider].key
      grantConfig[authProvider].secret = providerOptions[authProvider].secret

      // override grant.js redirect uri with uppy's custom redirect url
      if (oauthDomain) {
        const providerName = authToProviderName(authProvider)
        grantConfig[authProvider].redirect_uri = `${server.protocol}://${oauthDomain}/${providerName}/redirect`
      }
    } else if (authProvider !== 's3') { // TODO: there should be a cleaner way to do this.
      console.warn(`uppy: skipping one found unsupported provider "${authProvider}".`)
    }
  })
}

const authToProviderName = (authProvider) => {
  const providers = exports.getDefaultProviders()
  const providerNames = Object.keys(providers)
  for (const name of providerNames) {
    const provider = providers[name]
    if (provider.authProvider === authProvider) {
      return name
    }
  }
}

const validOptions = ({ server, providerOptions }) => {
  return server.host && server.protocol
}
