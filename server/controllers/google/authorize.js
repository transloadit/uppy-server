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

  if (this.session.google.token !== undefined) {
    yield function checkAuth (cb) {
      google.get('files', {
        auth: {
          bearer: self.session.google.token
        }
      }, function (err, res, body) {
        if (err) {
          if (err.error.code === 401) {
            self.session.google.token = null
            self.body = {
              isAuthenticated: false
            }
            cb()
            // Can't figure out how to get refresh tokens from API yet.
            // google.get('', {
            //   qs: {
            //     refresh_token: self.session.google.refreshToken
            //   }
            // }, function (err, res, body) {
            //   console.log('we re good')
            //   self.body = {
            //     isAuthenticated: true
            //   }
            //   console.log(err)
            //   console.log(res)
            //   console.log(body)
            //   cb()
            // })
          }
        } else {
          self.body = {
            isAuthenticated: true
          }
          cb()
        }
      })
    }
  } else {
    this.body = {
      isAuthenticated: false
    }
  }
}
