#!/usr/bin/env node
var koa = require('koa')
var session = require('koa-session')
var cors = require('koa-cors')
var mount = require('koa-mount')
var bodyParser = require('koa-bodyparser')
var Grant = require('grant-koa')
var grant = new Grant(require('./config/grant'))
var googleGet = require('./server/websocket/google/get')
var googleList = require('./server/websocket/google/list')

var wss = require('./websocket')
wss.on('connection', function (ws) {
  ws.on('message', routeMessage.bind(this, ws))

  ws.on('google:get', function (data) {
    console.log('google:get')
    googleGet(data, ws)
  })

  ws.on('google:list', function (data) {
    googleList(data, ws)
  })
})

function routeMessage (ws, message) {
  try {
    var parsedMessage = JSON.parse(message)
    ws.emit(parsedMessage.action, parsedMessage.payload)
  } catch (err) {
    // not sure how we should be handling errors
    return err
  }
}

var version = require('./package.json').version
var app = koa()
require('koa-qs')(app)

app.keys = ['grant']

app.use(session(app))
app.use(bodyParser())
app.use(mount(grant))
app.use(cors({
  methods: 'GET,HEAD,PUT,POST,DELETE,OPTIONS',
  origin: function (req) {
    // You cannot allow multiple domains besides *
    // http://stackoverflow.com/a/1850482/151666
    // so we make it dynamic, depending on who is asking
    var originWhiteList = [ process.env.UPPY_ENDPOINT ]
    var origin = req.header.origin
    if (originWhiteList.indexOf(origin) !== -1) {
      return origin
    }
    return process.env.UPPY_ENDPOINT
  },
  credentials: true
}))

require('./server/routes')(app)
app.listen(3020)

console.log('Uppy-server ' + version + ' Listening on http://' + process.env.UPPYSERVER_DOMAIN + ':3020 servicing ' + process.env.UPPY_ENDPOINT)
