var dropboxController = require('../controllers/dropbox/auth')()
var redirectController = require('../controllers/redirect')

module.exports = [
  {
    type   : 'GET',
    route  : '/dropbox/callback',
    handler: dropboxController
  },
  // {
  //   type: 'POST',
  //   route: '/dropbox/fetch',
  //   handler: dropboxAuthController('dropbox')
  // },
  {
    type   : 'GET',
    route  : '/dropbox/connect',
    handler: redirectController('dropbox')
  }
]
