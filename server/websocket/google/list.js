/**
 * List files in a Google Drive folder
 */
module.exports = function (data, ws) {
  var Purest = require('purest')
  var google = new Purest({provider: 'google', api: 'drive'})

  // Query filters based on a file's parents
  var query = `'${data.dir}' in parents and trashed=false`

  google.get('files', {
    auth: {
      bearer: this.session.google.token
    },
    qs: {
      q: query
    }
  }, function (err, res, body) {
    if (err) {
      return
    }
  })
}
