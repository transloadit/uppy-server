const express = require('express')
const uppy = require('./index')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')

const PORT = 3020

const app = express()

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
  // let protocol = req.protocol

  // if (req.headers.origin) {
  //   protocol = req.headers.origin.startsWith('https') ? 'https' : 'http'
  // }
  // res.setHeader(
  //   'Access-Control-Allow-Origin',
  //   `${protocol}://${process.env.UPPY_ENDPOINT}`
  // )
  res.setHeader(
    'Access-Control-Allow-Origin',
    'http://localhost:3452'
  )
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

app.use(uppy.app())

app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message, error: err })
})

console.log('Welcome to Uppy Server!')
console.log(`Listening on http://0.0.0.0:${PORT}`)

const server = app.listen(PORT)

uppy.socket(server)
