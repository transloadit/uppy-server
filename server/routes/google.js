var router = require('koa-router')({ prefix: '/google' })
var handlers = require('../controllers/google')

module.exports = function (app) {
  router.use('/', function * (next) {
    if (!this.session.google) {
      this.session.google = {}
    }

    yield next
  })

  router.get('/authorize', handlers.authorize)
  router.get('/callback', handlers.callback)
  router.post('/get', handlers.get)
  router.get('/list', handlers.list)
  router.get('/logout', handlers.logout)

  app.use(router.routes())
  app.use(router.allowedMethods())
}
