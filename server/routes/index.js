var router = require('koa-router')()

module.exports = function (app) {
  require('./google')(app)
  router.get('/', function * (next) {
    this.body = [
      'Welcome to Uppy Server',
      '======================',
      ''
    ].join('\n')
  })

  app.use(router.routes())
  app.use(router.allowedMethods())
}
