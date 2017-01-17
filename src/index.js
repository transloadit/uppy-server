const express = require('express')
const session = require('express-session')
const Grant = require('grant-express')
const grant = new Grant(require('./config/grant'))
const dispatcher = require('./server/controllers/dispatcher')
const SocketServer = require('ws').Server
const emitter = require('./server/WebsocketEmitter')

module.exports.app = () => {
  const app = express()
  app.use(session({ secret: 'grant', resave: true, saveUninitialized: true }))
  app.use(grant)

  app.get('/:providerName/:action', dispatcher)
  app.get('/:providerName/:action/:id', dispatcher)
  app.post('/:providerName/:action', dispatcher)
  app.post('/:providerName/:action/:id', dispatcher)

  return app
}

module.exports.socket = (server) => {
  const wss = new SocketServer({ server })

  wss.on('connection', (ws) => {
    const fullPath = ws.upgradeReq.url
    const token = fullPath.replace(/\/api\//, '')

    function sendProgress (data) {
      ws.send(data, (err) => {
        if (err) {
          console.log(`Error: ${err}`)
        }
      })
    }

    emitter.emit(`connection:${token}`)
    emitter.on(token, sendProgress)

    ws.on('close', () => {
      emitter.removeListener(token, sendProgress)
    })
  })
}
