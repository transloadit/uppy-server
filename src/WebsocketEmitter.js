/**
 * Singleton event emitter that is shared between index.js and controllers.
 * Used to transmit events (such as progress, upload completion) from controllers,
 * such as the Google Drive 'get' controller, along to the client.
 */

var EventEmitter = require('events').EventEmitter

class ChannelEventQueue {
  constructor (isOpen) {
    this.isOpen = isOpen
    this.queue = []
  }
}

class SocketEventEmitter extends EventEmitter {
  constructor () {
    super()
    this.queues = {}
  }

  setOpenChannel (name) {
    if (!this.queues[name]) {
      this.queues[name] = new ChannelEventQueue(true)
    } else {
      this.queues[name].isOpen = true
    }
  }

  removeChannel (name) {
    delete this.queues[name]
  }

  emit () {
    var eventName = arguments[0]
    var channelQueue = this.queues[eventName]

    if (!channelQueue) {
      channelQueue = this.queues[eventName] = new ChannelEventQueue(false)
    }

    if (!channelQueue.isOpen) {
      channelQueue.queue.push[Array.prototype.slice.call(arguments, 1)]
    } else {
      super.emit(...arguments)
    }
  }
}
var emitter = new SocketEventEmitter()

module.exports = emitter
