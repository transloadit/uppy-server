'use strict'

var handlers = {
  auth: require('./auth'),
  get: require('./get'),
  list: require('./list'),
  logout: require('./logout')
}

function * routeDispatcher (next) {
  var action = this.params.action

  if (!handlers[action]) {
    // throw error
    console.log(action + 'handler not found')
  }

  yield handlers[action]
}

exports = module.exports = routeDispatcher
