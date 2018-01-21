const express = require('express')
// @ts-ignore
const Grant = require('grant-express')
const grantConfig = require('./config/grant')()
const providerManager = require('./server/provider')
const dispatcher = require('./server/controllers/dispatcher')
const s3 = require('./server/controllers/s3')
const url = require('./server/controllers/url')
const SocketServer = require('ws').Server
const emitter = require('./server/WebsocketEmitter')
const merge = require('lodash.merge')
const redis = require('redis')
const cookieParser = require('cookie-parser')
const {jsonStringify} = require('./server/utils')

const providers = providerManager.getDefaultProviders()
const defaultOptions = {
  server: {
    protocol: 'http',
    path: ''
  },
  providerOptions: {},
  debug: true
}

/**
 * Entry point into initializing the uppy-server app.
 *
 * @param {object} options
 */
module.exports.app = (options = {}) => {
  options = merge({}, defaultOptions, options)
  providerManager.addProviderOptions(options, grantConfig)

  const customProviders = options.customProviders
  if (customProviders) {
    providerManager.addCustomProviders(customProviders, providers, grantConfig)
  }

  const app = express()
  app.use(cookieParser()) // server tokens are added to cookies

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
  app.use('/s3', s3(options.providerOptions.s3))
  app.use('/url', url())
  app.get('/:providerName/:action', dispatcher)
  app.get('/:providerName/:action/:id', dispatcher)
  app.post('/:providerName/:action', dispatcher)
  app.post('/:providerName/:action/:id', dispatcher)

  app.param('providerName', providerManager.getProviderMiddleware(providers))

  return app
}

/**
 * the socket is used to send progress events during an upload
 *
 * @param {object} server
 * @param {object} options
 */
module.exports.socket = (server, options) => {
  const wss = new SocketServer({ server })
  const { redisUrl } = options

  // A new connection is usually created when an upload begins,
  // or when connection fails while an upload is on-going and,
  // client attempts to reconnect.
  wss.on('connection', (ws) => {
    // @ts-ignore
    const fullPath = ws.upgradeReq.url
    let redisClient
    // the token identifies which ongoing upload's progress, the socket
    // connection wishes to listen to.
    const token = fullPath.replace(/\/api\//, '')

    /**
     *
     * @param {{action: string, payload: object}} data
     */
    function sendProgress (data) {
      ws.send(jsonStringify(data), (err) => {
        if (err) console.error(err)
      })
    }

    // if the redis url is set, then we attempt to check the storage
    // if we have any already stored progress data on the upload.
    if (redisUrl) {
      if (!redisClient) {
        redisClient = redis.createClient({ url: redisUrl })
      }
      redisClient.get(token, (err, data) => {
        if (err) console.error(err)
        if (data) {
          const dataObj = JSON.parse(data.toString())
          if (dataObj.action) sendProgress(dataObj)
        }
      })
    }

    emitter.emit(`connection:${token}`)
    emitter.on(token, sendProgress)

    ws.on('message', (jsonData) => {
      const data = JSON.parse(jsonData.toString())
      emitter.emit(`${data.action}:${token}`)
    })

    ws.on('close', () => {
      emitter.removeListener(token, sendProgress)
    })
  })
}

/**
 * returns a logger function, that would log a message only if
 * the debug option is set to true
 *
 * @param {{debug: boolean}} options
 * @returns {function}
 */
const getDebugLogger = (options) => {
  /**
   *
   * @param {string} message
   */
  const conditonalLogger = (message) => {
    if (options.debug) {
      console.log(`uppy-server: ${message}`)
    }
  }

  return conditonalLogger
}

/**
 *
 * @param {object} options
 */
const getOptionsMiddleware = (options) => {
  /**
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  const middleware = (req, res, next) => {
    req.uppy = {
      options,
      authToken: req.cookies.uppyAuthToken,
      debugLog: getDebugLogger(options)
    }
    next()
  }

  return middleware
}
