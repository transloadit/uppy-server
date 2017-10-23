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
    return next()
  }

  const action = req.params.action
  const handler = handlers[action]

  if (!req.params.providerName || !handler || !req.uppyProvider) {
    return next()
  }

  const providerName = req.params.providerName
  const { err, payload } = tokenService.verifyToken(req.uppyAuthToken, req.uppyOptions.secret)
  if (handler.requiresAuth && (err || !payload[providerName])) {
    return res.sendStatus(401)
  }
  req.uppyProviderTokens = payload

  if (handler.requiresId && !req.params.id) {
    return next()
  }

  return handler.self(req, res, next)
}

exports = module.exports = routeDispatcher
