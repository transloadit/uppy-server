/**
 * Checks if a Google Drive token is in session store.
 * If one is found, it tests if access token is valid or expired
 * by fetching from the API.
 * If fetch fails or token not found in store, isAuthenticated is false.
 * Otherwise, it's true.
 */
module.exports = function (data) {
  if (!this.session.google) {
    this.websocket.send('google.auth.fail', {err: 'no token'})
    return
  }

  if (!this.session.google.token) {
    this.websocket.send('google.auth.fail', { err: 'no token' })
    return
  }

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

  self.websocket.send('uppy.debug', self.session.google.token)

  google.query()
    .get('files')
    .request(function (err, res, body) {
      if (err) {
        if (err.error.code === 401) {
          // self.session.google.token = null
        }

        self.websocket.send('google.auth.fail', { err: 'other error' })
        return
      }

      self.websocket.send('google.auth.pass')
    })
}
