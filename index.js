var koa = require('koa'); 
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
  this.body = JSON.stringify(this.query, null, 2);
});

router.get('/dropbox/fetch', function *(next) {
  this.redirect('http://www.dropbox.com/1/oauth2/authorize?response_type=code&client_id=' + authConfig.dropbox.clientKey + '&redirect_uri=http://localhost:3000/dropbox/callback');
})

router.get('/', function *(next) {
  // console.log(this.session);
})


app.listen(3000);

console.log('Listening on port 3000');