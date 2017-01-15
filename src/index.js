var express = require('express')
var session = require('express-session')
var Grant = require('grant-express')
var grant = new Grant(require('./config/grant'))
var dispatcher = require('./server/controllers/dispatcher')
var SocketServer = require('ws').Server
var emitter = require('./server/WebsocketEmitter')

module.exports.app = () => {
  var app = express()
  app.use(session({
    secret: 'grant',
    resave: true,
    saveUninitialized: true
  }))
  app.use(grant)

  app.get('/:providerName/:action', dispatcher)
  app.get('/:providerName/:action/:id', dispatcher)
  app.post('/:providerName/:action', dispatcher)
  app.post('/:providerName/:action/:id', dispatcher)

  return app
}

module.exports.socket = (server) => {
  var wss = new SocketServer({server: server})

  wss.on('connection', (ws) => {
    var fullPath = ws.upgradeReq.url
    var token = fullPath.replace(/\/api\//, '')

    function sendProgress (data) {
      ws.send(data, (err) => {
        if (err) console.log(`Error: ${err}`)
      })
    }

    emitter.emit(`connection:${token}`)
    emitter.on(token, sendProgress)

    ws.on('close', () => {
      emitter.removeListener(token, sendProgress)
    })
  })
}
