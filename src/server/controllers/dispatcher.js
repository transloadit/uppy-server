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

function * routeDispatcher (next) {
  if (!this.session || !this.request || !this.request.body) {
    return yield next
  }

  var action = this.params.action

  if (!this.params.providerName || !handlers[action]) {
    return yield next
  }

  var handler = handlers[action]

  if (handler.requiresAuth) {
    var providerName = this.params.providerName
    if (!this.session[providerName] || !this.session[providerName].token) {
      this.status = 401
      return yield next
    }
  }

  if (handler.requiresId && !this.params.id) {
    return yield next
  }

  yield handler.self
}

exports = module.exports = routeDispatcher
