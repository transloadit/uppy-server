#!/usr/bin/env node
var koa = require('koa')
var router = require('./server/routes')()
var session = require('koa-session')
var cors = require('koa-cors')
var mount = require('koa-mount')
var Grant = require('grant-koa')
var grant = new Grant(require('./config/auth'))

var app = koa()
require('koa-qs')(app)

app.keys = ['grant']

app.use(session(app))
app.use(mount(grant))
app.use(cors({
  origin     : 'http://localhost:4000',
  credentials: true
}))

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3002)

console.log('Listening on port 3002.')
