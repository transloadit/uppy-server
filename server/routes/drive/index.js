var controllers = require('../../controllers/drive')
var auth = controllers.auth
var get = controllers.get
var list = controllers.list

module.exports = function(router) {
  router.get('/drive/auth/authorize', auth.authorize)
  router.get('/drive/callback', auth.getToken)
  router.get('/drive/get', get)
  router.get('/drive/listFiles', list)
  return router;
}
