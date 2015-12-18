var koa = require('koa');  
var router = require('koa-router')();
var session = require('koa-session');
var mount = require('koa-mount');
var Grent = require('grant-koa');
var grant = new Grant({
  "server": {
    "protocol": "http",
    "host": "localhost:3000",
    "callback": "/callback",
    "transport": "session",
    "state": true
  },
  "dropbox": {
    "key": "",
    "secret": "",
    "scope": [],
    "callback": "/dropbox/callback"
  }
});

router.get('/', function *(next) {
  this.body = 'Hello World';
});

var app = koa();

app.keys = ['grant'];
app.use(session(app));

app.use(router.routes())
app.use(router.allowedMethods());

app.listen(3000);

console.log('Listening on port 3000');