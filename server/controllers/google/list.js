/**
 * List files in a Google Drive folder
 */
module.exports = function * (next) {
  var self = this
  var Purest = require('purest')
  var google = new Purest({provider: 'google', api: 'drive'})

  var token = self.query.demo ? process.env.UPPY_DEMO_TOKEN : self.session.google.token

  yield function listFiles (cb) {
    // Query filters based on a file's parents
    var query = `'${self.query.dir}' in parents and trashed=false`

    google.get('files', {
      auth: {
        bearer: token
      },
      qs: {
        q: query
      }
    }, function (err, res, body) {
      if (err) {
        var error = err.error
        console.log('[google.list] Error ' + error.code + ' ' + error.message)
        self.body = 'Error: ' + err
        return cb()
      }
      self.body = body

      cb()
    })
  }
}
