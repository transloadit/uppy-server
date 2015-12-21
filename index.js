var koa = require('koa'); 
var request = require('request');
var router = require('koa-router')();
var session = require('koa-session');
var mount = require('koa-mount');
var Grant = require('grant-koa');
var authConfig = require('./config/auth-config');
var grant = new Grant({
  "server": {
    "protocol": "http",
    "host": "localhost:3000",
    "callback": "/callback",
    "transport": "session",
    "state": true
  },
  "dropbox": {
    "key": authConfig.dropbox.clientKey,
    "secret": authConfig.dropbox.clientSecret,
    "scope": [],
    "callback": "/dropbox/callback"
  }
});

var app = koa();
require('koa-qs')(app);

app.keys = ['grant'];
app.use(session(app));
app.use(mount(grant))

app.use(router.routes())
app.use(router.allowedMethods());

router.get('/dropbox/callback', function *(next) {
  var code = this.query.code;

  request.post({
    url: 'https://api.dropboxapi.com/1/oauth2/token',
    qs: {
      code: code,
      grant_type: 'authorization_code',
      client_id: authConfig.dropbox.clientKey,
      client_secret: authConfig.dropbox.clientSecret,
      redirect_uri: 'http://localhost:3000/dropbox/callback'
    }
  }, function(err, res, body) {
    if (err) {
      return console.log(err);
    }

    this.session.tokens.dropbox = body.access_token;

  })
});

router.get('/dropbox/fetch', function *(next) {
  this.redirect('http://www.dropbox.com/1/oauth2/authorize?response_type=code&client_id=' + authConfig.dropbox.clientKey + '&redirect_uri=http://localhost:3000/dropbox/callback');
})

router.get('/', function *(next) {

})


app.listen(3000);

console.log('Listening on port 3000');