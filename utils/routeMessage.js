module.exports = function routeMessage (message) {
  try {
    var parsedMessage = JSON.parse(message)
    this.websocket.emit(parsedMessage.action, parsedMessage.payload)
  } catch (err) {
    // not sure how we should be handling errors
    return err
  }
}
