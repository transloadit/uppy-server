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

// Entry point into initializing the uppy-server app.
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
      // add it to the exposed custom headers.
      res.header('Access-Control-Expose-Headers', [res.get('Access-Control-Expose-Headers'), 'i-am'].join(', '))
      next()
    })
  }

  // add uppy options to the request object so it can be accessed by subsequent handlers.
  app.use('*', getOptionsMiddleware(options))
  app.get('/:providerName/:action', dispatcher)
  app.get('/:providerName/:action/:id', dispatcher)
  app.post('/:providerName/:action', dispatcher)
  app.post('/:providerName/:action/:id', dispatcher)

  app.use('/s3', s3(options.providerOptions.s3))
  app.param('providerName', providerManager.getProviderMiddleware(providers))

  return app
}

// the socket is used to send progress events during an upload
module.exports.socket = (server, { redisUrl }) => {
  const wss = new SocketServer({ server })

  // A new connection is usually created when an upload begins,
  // or when connection fails while an upload is on-going and,
  // client attempts to reconnect.
  wss.on('connection', (ws) => {
    const fullPath = ws.upgradeReq.url
    let redisClient
    // the token identifies which ongoing upload's progress, the socket
    // connection wishes to listen to.
    const token = fullPath.replace(/\/api\//, '')

    function sendProgress (data) {
      ws.send(JSON.stringify(data), (err) => {
        if (err) console.log(`Error: ${err}`)
      })
    }

    // if the redis url is set, then we attempt to check the storage
    // if we have any already stored progress data on the upload.
    if (redisUrl) {
      if (!redisClient) {
        redisClient = redis.createClient({ url: redisUrl })
      }
      redisClient.get(token, (err, data) => {
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
    req.uppyAuthToken = req.cookies.uppyAuthToken
    next()
  }
}
