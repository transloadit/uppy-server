/**
 * Singleton event emitter that is shared between index.js and controllers.
 * Used to transmit events (such as progress, upload completion) from controllers,
 * such as the Google Drive 'get' controller, along to the client.
 */

var EventEmitter = require('events').EventEmitter
var emitter = new EventEmitter()

module.exports = emitter
