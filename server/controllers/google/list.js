/**
 * List files in a Google Drive folder
 */
module.exports = function * (next) {
  var self = this
  var Purest = require('purest')
  var google = new Purest({provider: 'google', api: 'drive'})

  yield function listFiles (cb) {
    // Query filters based on a file's parents
    var query = `'${self.query.dir}' in parents and trashed=false`

    google.get('files', {
      auth: {
        bearer: this.session.google.token
      },
      qs: {
        q: query
      }
    }, function (err, res, body) {
      if (err) {
        this.body = 'Error: ' + err
        return cb()
      }

      self.body = body

      cb()
    })
  }
}
