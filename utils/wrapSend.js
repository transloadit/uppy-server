module.exports = function wrapSend (sendFn) {
  return function (action, payload, options, cb) {
    if (typeof payload === 'function') {
      cb = payload
      return sendFn.call(this, action, cb)
    }

    var message = JSON.stringify({
      action,
      payload
    })

    sendFn.call(this, message, options, cb)
  }
}
