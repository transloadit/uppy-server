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

  if (!this.params.provider) {
    return yield next
  }

  var action = this.params.action

  if (!handlers[action]) {
    // throw error
    console.log(action + 'handler not found')
  }

  yield handlers[action]
}

exports = module.exports = routeDispatcher
