var controllers = require('../../controllers/drive')
var auth = controllers.auth
var getFiles = controllers.get
var listFiles = controllers.list
var logout = controllers.logout

module.exports = function (router) {
  router.get('/drive/auth/authorize', auth.authorize())
  router.get('/drive/callback', auth.getToken())
  router.get('/drive/get', getFiles())
  router.get('/drive/list', listFiles())
  router.get('/drive/logout', logout())
  return router
}
