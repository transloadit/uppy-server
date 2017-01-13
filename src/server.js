var koa = require('koa')
var router = require('koa-router')()
var session = require('koa-session')
var cors = require('koa-cors')
var mount = require('koa-mount')
var bodyParser = require('koa-bodyparser')
var Grant = require('grant-koa')
var grant = new Grant(require('./config/grant'))
var SocketServer = require('ws').Server
var emitter = require('./WebsocketEmitter')
var dispatcher = require('./server/controllers/dispatcher')

var PORT = 3020

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
console.log('Listening on http://0.0.0.0:' + PORT)

var server = app.listen(PORT)

var wss = new SocketServer({
  server: server
})

wss.on('connection', function (ws) {
  console.log('new socket connection made')
  var fullPath = ws.upgradeReq.url
  var token = fullPath.replace(/\/api\//, '')

  emitter.setOpenChannel(token)
  var queuedMessages = emitter.queues[token].queue

  function sendProgress (data) {
    ws.send(data, function (err) {
      if (err) console.log('Error: ' + err)
    })
  }

  while (queuedMessages.length) {
    sendProgress(...queuedMessages[0])
    queuedMessages.splice(1)
  }

  emitter.on(token, sendProgress)

  ws.on('close', function () {
    console.log('new socket connectio closed')
    emitter.removeChannel(token)
    emitter.removeListener(token, sendProgress)
  })
})
