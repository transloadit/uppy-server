var koa = require('koa')
var routes = require('./server/routes')
var router = require('./server/router')(routes);
var session = require('koa-session')
var mount = require('koa-mount')
var Grant = require('grant-koa')
var auth = require('./config/auth-config')
var grant = new Grant({
  "server": {
    "protocol": "http",
    "host": "localhost:3000",
    "callback": "/callback",
    "transport": "session",
    "state": true
  },
  "dropbox": {
    "key": auth.dropbox.clientKey,
    "secret": auth.dropbox.clientSecret,
    "scope": [],
    "callback": "/dropbox/callback"
  },
  "google": {
    "key": auth.google.clientKey,
    "secret": auth.google.clientSecret,
    "scope": [],
    "callback": "/google/callback"
  },
  "instagram": {
    "key": auth.instagram.clientKey,
    "secret": auth.instagram.clientSecret,
    "scope": [],
    "callback": "/instagram/callback"
  }
})

var app = koa()
require('koa-qs')(app)

app.keys = ['grant']
app.use(session(app))
app.use(mount(grant))

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000)

console.log('Listening on port 3000')