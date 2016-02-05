var controllers = require('../../controllers/drive')
var auth = controllers.auth
var getFiles = controllers.get
var listFiles = controllers.list

module.exports = function (router) {
  router.get('/drive/auth/authorize', auth.authorize())
  router.get('/drive/callback', auth.getToken())
  router.get('/drive/get', getFiles())
  router.get('/drive/list', listFiles())
  return router
}
