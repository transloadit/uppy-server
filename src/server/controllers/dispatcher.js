const tokenService = require('../token-service')

const handlers = {
  authorized: { self: require('./authorized') },
  callback: { self: require('./callback') },
  get: { self: require('./get'), requiresAuth: true, requiresId: true },
  thumbnail: { self: require('./thumbnail'), requiresAuth: true, requiresId: true },
  list: { self: require('./list'), requiresAuth: true },
  logout: { self: require('./logout') },
  connect: { self: require('./connect') },
  redirect: { self: require('./oauth-redirect') }
}

function routeDispatcher (req, res, next) {
  if (!req.session || !req.body) {
    req.uppy.debugLog('No session/body attached to req object. Exiting dispatcher.')
    return next()
  }

  const action = req.params.action
  const handler = handlers[action]

  if (!req.params.providerName || !handler || !req.uppy.provider) {
    req.uppy.debugLog('No provider/provider-handler found. Exiting dispatcher.')
    return next()
  }

  const providerName = req.params.providerName
  const { err, payload } = tokenService.verifyToken(req.uppy.authToken, req.uppy.options.secret)
  if (handler.requiresAuth && (err || !payload[providerName])) {
    return res.sendStatus(401)
  }
  req.uppy.providerTokens = payload

  if (handler.requiresId && !req.params.id) {
    req.uppy.debugLog('id Param is not specified, but required. Exiting dispatcher.')
    return next()
  }

  req.uppy.debugLog('Found an handler for request.')
  return handler.self(req, res, next)
}

module.exports = routeDispatcher
