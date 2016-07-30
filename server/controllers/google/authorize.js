/**
 * Checks if a Google Drive token is in session store.
 * If one is found, it tests if access token is valid or expired
 * by fetching from the API.
 * If fetch fails or token not found in store, isAuthenticated is false.
 * Otherwise, it's true.
 */
module.exports = function * (next) {
  var self = this
  var Purest = require('purest')
  var google = new Purest({
    provider: 'google',
    api: 'drive'
  })

  if (this.session.google.token === undefined) {
    this.body = { isAuthenticated: false }
    yield next
  }

  yield function checkAuth (cb) {
    google.get('files', {
      auth: {
        bearer: self.session.google.token
      }
    }, function (err, res, body) {
      if (err) {
        if (err.error && err.error.code === 401) {
          self.session.google.token = null
        }

        self.body = {
          isAuthenticated: false
        }
        return cb()
      }

      self.body = {
        isAuthenticated: true
      }
      return cb()
    })
  }
}
