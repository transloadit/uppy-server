/**
 * List files in a Google Drive folder
 */
module.exports = function (data) {
  var self = this
  var Purest = require('purest')
  var google = new Purest({
    provider: 'google',
    api: 'drive'
  })
  console.log('list token: ', self.session.google.token)
  // Query filters based on a file's parents
  var query = `'${data.dir}' in parents and trashed=false`
  google.get('files', {
    auth: {
      bearer: self.session.google.token
    },
    qs: {
      q: query
    }
  }, function (err, res, body) {
    if (err) {
      console.log('Error:', err)
      self.websocket.send('google.list.fail', err)
      return
    }

    self.websocket.send('google.list.ok', body)
  })
}
