const express = require('express')
const uppy = require('./uppy')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const promBundle = require('express-prom-bundle')
const session = require('express-session')
const connectRedis = require('connect-redis')

const app = express()

const metricsMiddleware = promBundle({includeMethod: true, includePath: true})

const promClient = metricsMiddleware.promClient
const collectDefaultMetrics = promClient.collectDefaultMetrics
collectDefaultMetrics({ register: promClient.register })

// log server requests.
app.use(morgan('combined'))

// make app metrics available at '/metrics'.
app.use(metricsMiddleware)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressValidator())
app.use(cookieParser())

// Use helmet to secure Express headers
app.use(helmet.frameguard())
app.use(helmet.xssFilter())
app.use(helmet.noSniff())
app.use(helmet.ieNoOpen())
app.disable('x-powered-by')

const sessionOptions = {
  secret: process.env.UPPYSERVER_SECRET,
  resave: true,
  saveUninitialized: true
}

if (process.env.UPPYSERVER_REDIS_URL) {
  const RedisStore = connectRedis(session)
  sessionOptions.store = new RedisStore({
    url: process.env.UPPYSERVER_REDIS_URL
  })
}

const sessionMiddleware = session(sessionOptions)

app.use(sessionMiddleware)

app.use((req, res, next) => {
  const protocol = process.env.UPPYSERVER_PROTOCOL

  if (process.env.UPPY_ENDPOINTS) {
    const whitelist = process.env.UPPY_ENDPOINTS
      .split(',')
      .map((domain) => `${protocol}://${domain}`)

    if (req.headers.origin && whitelist.indexOf(req.headers.origin) > -1) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Origin, Content-Type, Accept'
  )
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})

// Routes
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send(
    [ 'Welcome to Uppy Server', '======================', '' ].join('\n')
  )
})

const uppyOptions = {
  s3: {
    key: process.env.UPPYSERVER_AWS_KEY,
    secret: process.env.UPPYSERVER_AWS_SECRET,
    bucket: process.env.UPPYSERVER_AWS_BUCKET,
    region: process.env.UPPYSERVER_AWS_REGION
  },
  providerOptions: {
    google: {
      key: process.env.UPPYSERVER_GOOGLE_KEY,
      secret: process.env.UPPYSERVER_GOOGLE_SECRET
    },
    dropbox: {
      key: process.env.UPPYSERVER_DROPBOX_KEY,
      secret: process.env.UPPYSERVER_DROPBOX_SECRET
    },
    instagram: {
      key: process.env.UPPYSERVER_INSTAGRAM_KEY,
      secret: process.env.UPPYSERVER_INSTAGRAM_SECRET
    }
  },
  server: {
    host: process.env.UPPYSERVER_DOMAIN,
    protocol: process.env.UPPYSERVER_PROTOCOL,
    path: process.env.UPPYSERVER_PATH,
    oauthDomain: process.env.UPPYSERVER_OAUTH_DOMAIN,
    validHosts: (process.env.UPPYSERVER_DOMAINS || process.env.UPPYSERVER_DOMAIN).split(',')
  },
  filePath: process.env.UPPYSERVER_DATADIR
}

if (process.env.UPPYSERVER_SELF_ENDPOINT) {
  uppyOptions.sendSelfEndpoint = process.env.UPPYSERVER_SELF_ENDPOINT
}

app.use(uppy.app(uppyOptions))

app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

if (app.get('env') === 'production') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: 'Something went wrong' })
  })
} else {
  app.use((err, req, res, next) => {
    console.error('\x1b[31m', err.stack, '\x1b[0m')
    res.status(err.status || 500).json({ message: err.message, error: err })
  })
}

module.exports = { app, sessionMiddleware }
