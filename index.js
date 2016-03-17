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
  origin: 'http://localhost:4000',
  credentials: true
}))

require('./server/routes')(app)
app.listen(8080)

console.log('Listening on port 8080.')
