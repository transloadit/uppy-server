var controllers = require('../../controllers/drive')

var auth = controllers.auth
var listFiles = controllers.listFiles

module.exports = function(router) {
  router.get('/drive/auth/authorize', auth.getAuthUrl)
  router.get('/drive/callback', auth.getToken)
  router.get('/drive/listFiles', listFiles)

  return router;
}
