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
