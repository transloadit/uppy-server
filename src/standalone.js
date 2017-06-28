const express = require('express')
const uppy = require('./pluggable')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const librato = require('librato-node')

const app = express()

app.use(morgan('combined'))

if (process.env.UPPYSERVER_LIBRATO_TOKEN && process.env.UPPYSERVER_LIBRATO_EMAIL) {
  librato.configure({
    email: process.env.UPPYSERVER_LIBRATO_EMAIL,
    token: process.env.UPPYSERVER_LIBRATO_TOKEN
  })

  app.use(librato.middleware())
}

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

app.use((req, res, next) => {
  const protocol = process.env.UPPYSERVER_PROTOCOL
  const whitelist = [
    `${protocol}://${process.env.UPPY_ENDPOINT}`,
    `${protocol}://codepen.io`,
    `${protocol}://s.codepen.io`
  ]

  if (req.headers.origin && whitelist.indexOf(req.headers.origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
  } else {
    res.setHeader('Access-Control-Allow-Origin', `${protocol}://${process.env.UPPY_ENDPOINT}`)
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

app.use(uppy.app({
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
  }
}))

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

module.exports = app
