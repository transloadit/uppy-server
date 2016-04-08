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
    return [
      'http://localhost:4000',
      'http://uppy.io'
    ].join(', ')
  },
  credentials: true
}))

require('./server/routes')(app)
app.listen(3020)

console.log('Listening on http://0.0.0.0:3020')
