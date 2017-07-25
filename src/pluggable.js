const express = require('express')
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
  app.use(new Grant(grantConfig))

  if (options.sendSelfEndpoint) {
    app.use('*', (req, res, next) => {
      const { protocol } = grantConfig.server
      res.header('i-am', `${protocol}://${options.sendSelfEndpoint}`)
      // maybe this should be concatenated with its previously set value.
      res.header('Access-Control-Expose-Headers', 'i-am')
      next()
    })
  }

  app.get('/:providerName/:action', dispatcher)
  app.get('/:providerName/:action/:id', dispatcher)
  app.post('/:providerName/:action', dispatcher)
  app.post('/:providerName/:action/:id', dispatcher)

  app.param('providerName', providerManager.getProviderMiddleware(providers))

  return app
}

module.exports.socket = (server, session) => {
  const wss = new SocketServer({ server })

  wss.on('connection', (ws) => {
    session(ws.upgradeReq, {}, () => {
      const fullPath = ws.upgradeReq.url
      const token = fullPath.replace(/\/api\//, '')

      function sendProgress (data) {
        ws.send(JSON.stringify(data), (err) => {
          if (err) console.log(`Error: ${err}`)
        })
      }

      const uploadState = ws.upgradeReq.session.uploads[token]

      if (uploadState && uploadState.action !== 'start') sendProgress(uploadState)
      else emitter.emit(`connection:${token}`)

      emitter.on(token, sendProgress)

      ws.on('message', (jsonData) => {
        const data = JSON.parse(jsonData)
        emitter.emit(`${data.action}:${token}`)
      })

      ws.on('close', () => {
        emitter.removeListener(token, sendProgress)
      })
    })
  })
}
