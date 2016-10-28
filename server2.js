// var koa = require('koa')
// var router = require('koa-router')()
// var session = require('koa-session')
// var cors = require('koa-cors')
// var mount = require('koa-mount')
// var bodyParser = require('koa-bodyparser')
// var Grant = require('grant-koa')
// var grant = new Grant(require('./config/grant'))
// var dispatcher = require('./server/controllers/dispatcher')

// var server = function (options, config) {
//   // Server setup
//   var app = koa()

//   require('koa-qs')(app)

//   app.keys = ['grant']
//   app.use(bodyParser())
//   app.use(session(app))
//   app.use(mount(grant))
//   // app.use(cors({
//   //   methods: 'GET,HEAD,PUT,POST,DELETE,OPTIONS',
//   //   origin: function (req) {
//   //     // You cannot allow multiple domains besides *
//   //     // http://stackoverflow.com/a/1850482/151666
//   //     // so we make it dynamic, depending on who is asking
//   //     var originWhiteList = [ process.env.UPPY_ENDPOINT ]
//   //     var origin = req.header.origin
//   //     if (originWhiteList.indexOf(origin) !== -1) {
//   //       return origin
//   //     }
//   //     return process.env.UPPY_ENDPOINT
//   //   },
//   //   credentials: true
//   // }))

//   // Routes
//   router.get('/:provider/:action', dispatcher)
//   router.get('/:provider/:action/:id', dispatcher)
//   router.post('/:provider/:action', dispatcher)
//   router.post('/:provider/:action/:id', dispatcher)

//   app.use(router.routes())

//   // Start server
//   app.listen(options.port)

//   console.log('Uppy Server is now listening')
// }

// module.exports = server
