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

  if (handler.requiresAuth) {
    const providerName = req.params.providerName
    if (!req.session[providerName] || !req.session[providerName].token) {
      return res.sendStatus(401)
    }
  }

  if (handler.requiresId && !req.params.id) {
    return next()
  }

  return handler.self(req, res, next)
}

exports = module.exports = routeDispatcher
