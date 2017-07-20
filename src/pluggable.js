const express = require('express')
const session = require('express-session')
const Grant = require('grant-express')
const grantConfig = require('./config/grant')
const providerManager = require('./server/provider')
const dispatcher = require('./server/controllers/dispatcher')
const SocketServer = require('ws').Server
const emitter = require('./server/WebsocketEmitter')

const providers = providerManager.getDefaultProviders()

/**
 * @param {Object} options - configurations for the uppy app.
 * Valid configuration options include:
 *  customProviders - an object of the format:
 *    {[providerName]: {
 *        config: provider config,
 *        module: provider module
 *      }
 *    }
 * @return express js pluggagle app.
 */
module.exports.app = (options = {}) => {
  providerManager.addProviderOptions(options.providerOptions, grantConfig)

  const customProviders = options.customProviders
  if (customProviders) {
    providerManager.addCustomProviders(customProviders, providers, grantConfig)
  }

  const app = express()
  app.use(session({ secret: 'grant', resave: true, saveUninitialized: true }))
  app.use(new Grant(grantConfig))
  app.use('*', (req, res, next) => {
    const { protocol, host, path } = grantConfig.server
    res.header('i-am', `${protocol}://${host}${path || ''}`)
    next()
  })

  app.get('/:providerName/:action', dispatcher)
  app.get('/:providerName/:action/:id', dispatcher)
  app.post('/:providerName/:action', dispatcher)
  app.post('/:providerName/:action/:id', dispatcher)

  app.param('providerName', providerManager.getProviderMiddleware(providers))

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

    ws.on('message', (jsonData) => {
      const data = JSON.parse(jsonData)
      emitter.emit(`${data.action}:${token}`)
    })

    ws.on('close', () => {
      emitter.removeListener(token, sendProgress)
    })
  })
}
