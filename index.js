#!/usr/bin/env node
var koa = require('koa')
var session = require('koa-session')
var cors = require('koa-cors')
var mount = require('koa-mount')
var Grant = require('grant-koa')
var grant = new Grant(require('./config/grant'))

// router.get('/', function *(next) {
//   this.body = 'hello world'
// })

var app = koa()
require('koa-qs')(app)

app.keys = ['grant']

app.use(session(app))
app.use(mount(grant))
app.use(cors({
  methods: 'GET,HEAD,PUT,POST,DELETE,OPTIONS',
  origin: function (req) {
    // You cannot allow multiple domains besides *
    // http://stackoverflow.com/a/1850482/151666
    // so we make it dynamic, depending on who is asking
    var originWhiteList = [ 'http://localhost:4000', 'http://uppy.io' ]
    var origin = req.header.origin
    if (originWhiteList.indexOf(origin) !== -1) {
      return origin
    }
    return false
  },
  credentials: true
}))

require('./server/routes')(app)
app.listen(3020)

console.log('Listening on http://0.0.0.0:3020')
