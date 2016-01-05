var koa = require('koa')
var request = require('request')
var router = require('koa-router')()
var routes = require('./server/routes');
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

function authCallbackHandler(provider) {
  if (!this.session.tokens) {
    this.session.tokens = {}
  }
  console.log(this.session.tokens)
  console.log(this.query.code)
  request.post({
    url: auth[provider].tokenURI,
    json: true,
    qs: {
      code: this.query.code,
      grant_type: 'authorization_code',
      client_id: auth[provider].clientKey,
      client_secret: auth[provider].clientSecret,
      redirect_uri: 'http://localhost:3000/dropbox/callback'
    },
    headers: [
      {
        name: 'content-type',
        value: 'application/json'
      }
    ]
  }, (err, res, body) => {
    if (err) {
      return console.log(err)
    }
  
    this.session.tokens[provider] = body.access_token

  })
}

router.get('/dropbox/callback', function *(next) {
  authCallbackHandler.bind(this)('dropbox');
})

router.get('/google/callback', function *(next) {
  authCallbackHandler('google').bind(this)
})

router.get('/instagram/callback', function *(next) {
  authCallbackHandler('instagram').bind(this)
})

router.get('/dropbox/connect', function *(next) {
  this.redirect('http://www.dropbox.com/1/oauth2/authorize?response_type=code&client_id=' + auth.dropbox.clientKey + '&redirect_uri=http://localhost:3000/dropbox/callback')
})

router.get('/dropbox/connect', function *(next) {
  this.redirect('http://www.dropbox.com/1/oauth2/authorize?response_type=code&client_id=' + auth.dropbox.clientKey + '&redirect_uri=http://localhost:3000/dropbox/callback')
})

router.get('/google/connect', function *(next) {
  this.redirect('http://www.google.com/1/oauth2/authorize?response_type=code&client_id=' + auth.google.clientKey + '&redirect_uri=http://localhost:3000/google/callback')
})

router.get('/instagram/connect', function *(next) {
  this.redirect('http://www.instagram.com/1/oauth2/authorize?response_type=code&client_id=' + auth.instagram.clientKey + '&redirect_uri=http://localhost:3000/instagram/callback')
})

router.get('/', function *(next) {
  console.log('index')
})



app.listen(3000)

console.log('Listening on port 3000')