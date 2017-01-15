var express = require('express')
var uppy = require('./index')
var helmet = require('helmet')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var expressValidator = require('express-validator')

var PORT = 3020

var app = express()

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

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', req.protocol + '://' + process.env.UPPY_ENDPOINT)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Origin, Content-Type, Accept')
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})

// Routes
app.get('/', function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.send([
    'Welcome to Uppy Server',
    '======================',
    ''
  ].join('\n'))
})

app.use(uppy.app())

app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({message: err.message, error: err})
})

console.log('Welcome to Uppy Server!')
console.log('Listening on http://0.0.0.0:' + PORT)

var server = app.listen(PORT)

uppy.socket(server)
