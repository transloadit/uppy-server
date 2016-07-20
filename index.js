#!/usr/bin/env node
var koa = require('koa')
var websockify = require('koa-websocket')
var session = require('koa-session')
var cors = require('koa-cors')
var mount = require('koa-mount')
var bodyParser = require('koa-bodyparser')
var Grant = require('grant-koa')
var grant = new Grant(require('./config/grant'))
var route = require('koa-route')

// websocket utils
var routeMessage = require('./utils/routeMessage')
var wrapSend = require('./utils/wrapSend')

// google websocket event handlers
var googleGet = require('./server/websocket/google/get')
var googleAuth = require('./server/websocket/google/authorize')
var googleLogout = require('./server/websocket/google/logout')
var googleList = require('./server/websocket/google/list')

var app = websockify(koa())

var version = require('./package.json').version

require('koa-qs')(app)

app.keys = ['grant']
var sess = session(app)

app.use(sess)
app.ws.use(sess)

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

// websocket event subscribers
app.ws.use(route.all('/', function * (next) {
  console.log(this.session)
  this.session = null
  this.websocket.send = wrapSend(this.websocket.send).bind(this.websocket)
  app.context.websocket = this.websocket
  this.websocket.send('uppy.debug', 'websocket init')
  this.websocket.on('message', routeMessage.bind(this))
  this.websocket.on('google.get', googleGet.bind(this))
  this.websocket.on('google.auth', googleAuth.bind(this))
  this.websocket.on('google.logout', googleLogout.bind(this))
  this.websocket.on('google.list', googleList.bind(this))
  this.websocket.on('google.callback', (token) => {
    if (!this.session.google) {
      this.session.google = {}
    }
    this.session.google.token = token
    this.websocket.send('google.auth.complete')
    this.websocket.send('google.auth.pass')
  })
}))

require('./server/routes')(app)

app.listen(3020)

console.log('Uppy-server ' + version + ' Listening on http://' + process.env.UPPYSERVER_DOMAIN + ':3020 servicing ' + process.env.UPPY_ENDPOINT)
