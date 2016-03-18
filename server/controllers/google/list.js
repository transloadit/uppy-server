module.exports = function * (next) {
  var self = this
  var Purest = require('purest')
  var google = new Purest({provider: 'google', api: 'drive'})
  yield function listFiles (cb) {
    google.get('files', {
      auth: {
        bearer: this.session.google.token
      }
    }, function (err, res, body) {
      if (err) {
        console.log('error ', err)
        this.body = 'Error: ' + err
        return cb()
      }

      self.body = body
      cb()
    })
  }
}
