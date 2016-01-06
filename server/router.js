var router = require('koa-router')()

module.exports = function(routes) {
  routes.forEach(function(route) {
    router[route.type.toLowerCase()](route.route, route.handler)
  })

  return router;
}