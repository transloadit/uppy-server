/**
 * Checks if a Google Drive token is in session store.
 * If one is found, it tests if access token is valid or expired
 * by fetching from the API.
 * If fetch fails or token not found in store, isAuthenticated is false.
 * Otherwise, it's true.
 */
module.exports = function (data) {
  var self = this
  var Purest = require('purest')
  var google = new Purest({
    provider: 'google',
    api: 'drive',
    defaults: {
      auth: {
        bearer: self.session.google.token
      }
    }
  })

  if (self.session.google.token === undefined) {
    self.websocket.send('google.auth.fail')
  }

  google.query()
    .get('files')
    .request(function (err, res, body) {
      if (err) {
        if (err.error.code === 401) {
          // self.session.google.token = null
        }

        self.websocket.send('google.auth.fail')
        return
      }

      self.websocket.send('google.auth.pass')
    })
}
