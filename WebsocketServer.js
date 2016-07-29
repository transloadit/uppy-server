var SocketServer = require('ws').Server

var wss = new SocketServer({
  port: 3121
})

module.exports = wss
