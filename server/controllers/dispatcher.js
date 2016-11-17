'use strict'

var handlers = {
  auth: require('./auth'),
  callback: require('./callback'),
  get: require('./get'),
  list: require('./list'),
  logout: require('./logout')
}

function * routeDispatcher (next) {
  if (!this.session || !this.request || !this.request.body) {
    return yield next
  }

  var action = this.params.action

  if (!this.params.provider || !handlers[action]) {
    return yield next
  }

  yield handlers[action]
}

exports = module.exports = routeDispatcher
