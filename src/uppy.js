const express = require('express')
const Grant = require('grant-express')
const grantConfig = require('./config/grant')()
const providerManager = require('./server/provider')
const dispatcher = require('./server/controllers/dispatcher')
const s3 = require('./server/controllers/s3')
const SocketServer = require('ws').Server
const emitter = require('./server/WebsocketEmitter')
const merge = require('lodash.merge')
const redis = require('redis')

const providers = providerManager.getDefaultProviders()
const defaultOptions = {
  server: {
    protocol: 'http',
    path: ''
  },
  providerOptions: {}
}

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
  options = merge({}, defaultOptions, options)
  providerManager.addProviderOptions(options, grantConfig)

  const customProviders = options.customProviders
  if (customProviders) {
    providerManager.addCustomProviders(customProviders, providers, grantConfig)
  }

  const app = express()
  app.use(new Grant(grantConfig))

  if (options.sendSelfEndpoint) {
    app.use('*', (req, res, next) => {
      const { protocol } = options.server
      res.header('i-am', `${protocol}://${options.sendSelfEndpoint}`)
      // maybe this should be concatenated with its previously set value.
      res.header('Access-Control-Expose-Headers', 'i-am')
      next()
    })
  }

  app.use('*', getOptionsMiddleware(options))
  app.get('/:providerName/:action', dispatcher)
  app.get('/:providerName/:action/:id', dispatcher)
  app.post('/:providerName/:action', dispatcher)
  app.post('/:providerName/:action/:id', dispatcher)

  app.use('/s3', s3(options.providerOptions.s3))
  app.param('providerName', providerManager.getProviderMiddleware(providers))

  return app
}

module.exports.socket = (server, { redisUrl }) => {
  const wss = new SocketServer({ server })

  wss.on('connection', (ws) => {
    const fullPath = ws.upgradeReq.url
    const token = fullPath.replace(/\/api\//, '')

    function sendProgress (data) {
      ws.send(JSON.stringify(data), (err) => {
        if (err) console.log(`Error: ${err}`)
      })
    }

    if (redisUrl) {
      // TODO: maybe redis client should be a global variable.
      //    that is only created once.
      redis.createClient({ url: redisUrl }).get(token, (err, data) => {
        if (err) console.log(err)
        if (data) {
          data = JSON.parse(data.toString())
          if (data.action) sendProgress(data)
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

const getOptionsMiddleware = (options) => {
  return (req, res, next) => {
    req.uppyOptions = options
    next()
  }
}
