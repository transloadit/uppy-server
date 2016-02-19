var router = require('koa-router')({ prefix: '/google' })
var handlers = require('../controllers/google')

module.exports = function(app) {
  router.use('/', function *(next) {
    if (!this.session.google) {
      this.session.google = {}
    }

    yield next
  })

  router.get('/callback', handlers.callback)
  router.get('/list', handlers.list)

  app.use(router.routes())
  app.use(router.allowedMethods())
}