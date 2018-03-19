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
const { jsonStringify, getURLBuilder } = require('./server/utils')
const jobs = require('./server/jobs')
const interceptor = require('express-interceptor')
const logger = require('./server/logger')

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

  app.use(interceptGrantErrorResponse)
  app.use(new Grant(grantConfig))
  if (options.sendSelfEndpoint) {
    // TODO: handle Access-Control-Allow-Origin here instead of externally
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

  if (app.get('env') !== 'test') {
    jobs.startCleanUpJob(options.filePath)
  }

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
        if (err) logger.error(err, 'socket.progress.error')
      })
    }

    // if the redis url is set, then we attempt to check the storage
    // if we have any already stored progress data on the upload.
    if (redisUrl) {
      if (!redisClient) {
        redisClient = redis.createClient({ url: redisUrl })
      }
      redisClient.get(token, (err, data) => {
        if (err) logger.error(err, 'socket.redis.error')
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

// intercepts grantJS' default response error when something goes
// wrong during oauth process.
const interceptGrantErrorResponse = interceptor((req, res) => {
  return {
    isInterceptable: () => {
      // match grant.js' callback url
      return /^\/connect\/\w+\/callback/.test(req.path)
    },
    intercept: (body, send) => {
      const unwantedBody = 'error=Grant%3A%20missing%20session%20or%20misconfigured%20provider'
      if (body === unwantedBody) {
        logger.error(`grant.js responded with error: ${body}`, 'grant.oauth.error')
        send([
          'Uppy-server was unable to complete the OAuth process :(',
          '(Hint, try clearing your cookies and try again)'
        ].join('\n'))
      } else {
        send(body)
      }
    }
  }
})

/**
 * returns a logger function, that would log a message only if
 * the debug option is set to true
 *
 * @param {{debug: boolean}} options
 * @returns {function}
 */
const getDebugLogger = (options) => {
  // TODO: deprecate this.
  // TODO: add line number and originating file
  /**
   *
   * @param {string} message
   */
  const conditonalLogger = (message) => {
    if (options.debug) {
      logger.debug(message, 'debugLog')
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
      debugLog: getDebugLogger(options),
      buildURL: getURLBuilder(options)
    }
    next()
  }

  return middleware
}
