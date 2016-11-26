const koa = require('koa')
var router = require('koa-router')()
var session = require('koa-session')
var cors = require('koa-cors')
var mount = require('koa-mount')
var bodyParser = require('koa-bodyparser')
var Grant = require('grant-koa')
var grant = new Grant(require('./config/grant'))
var SocketServer = require('ws').Server

var dispatcher = require('./server/controllers/dispatcher')

// Server setup
var app = koa()

require('koa-qs')(app)

app.keys = ['grant']
app.use(bodyParser())
app.use(session(app))
app.use(mount(grant))
app.use(cors({
  methods: 'GET,HEAD,PUT,POST,DELETE,OPTIONS',
  origin: function (req) {
    // You cannot allow multiple domains besides *
    // http://stackoverflow.com/a/1850482/151666
    // so we make it dynamic, depending on who is asking
    var originWhiteList = [
      process.env.UPPY_ENDPOINT
    ]
    var origin = req.header.origin

    if (origin) {
      // Not everyone supplies an origin. Such as Pingdom
      var originDomain = (origin + '').replace(/^https?:\/\//i, '')

      if (originWhiteList.indexOf(originDomain) !== -1) {
        return origin
      }
    }

    return req.protocol + '://' + process.env.UPPY_ENDPOINT
  },
  credentials: true
}))

// Routes
router.get('/', function * (next) {
  this.body = [
    'Welcome to Uppy Server',
    '======================',
    ''
  ].join('\n')
})
router.get('/:providerName/:action', dispatcher)
router.get('/:providerName/:action/:id', dispatcher)
router.post('/:providerName/:action', dispatcher)
router.post('/:providerName/:action/:id', dispatcher)

app.use(router.routes())

app.use(function * notFound (next) {
  yield next

  if (this.status !== 404) return

  this.status = 404
})

console.log('Welcome to Uppy Server!')
console.log('Listening on http://0.0.0.0:3020')
var server = app.listen(3020)

var wss = new SocketServer({
  server: server
})

var emitter = require('./WebsocketEmitter')

wss.on('connection', function (ws) {
  var fullPath = ws.upgradeReq.url
  var token = fullPath.replace(/\/api\//, '')

  function sendProgress (data) {
    ws.send(data, function (err) {
      if (err) console.log('Error: ' + err)
    })
  }

  emitter.on(token, sendProgress)

  ws.on('close', function () {
    emitter.removeListener(token, sendProgress)
  })
})
