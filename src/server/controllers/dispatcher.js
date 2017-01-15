'use strict'

var handlers = {
  auth: { self: require('./auth') },
  callback: { self: require('./callback') },
  get: {
    self: require('./get'),
    requiresAuth: true,
    requiresId: true
  },
  list: { self: require('./list'), requiresAuth: true },
  logout: { self: require('./logout') }
}

function routeDispatcher (req, res, next) {
  if (!req.session || !req.body) {
    return next()
  }

  var action = req.params.action
  var handler = handlers[action]

  if (!req.params.providerName || !handler) {
    return next()
  }

  if (handler.requiresAuth) {
    var providerName = req.params.providerName
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
