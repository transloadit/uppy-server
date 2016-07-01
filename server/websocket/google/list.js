/**
 * List files in a Google Drive folder
 */
module.exports = function (data) {
  var self = this

  self.websocket.send('uppy.debug', {message: 'top of list'})
  self.websocket.send('uppy.debug', {message: JSON.stringify(data)})
  self.websocket.send('uppy.debug', { message: self.session })
  var Purest = require('purest')
  var google = new Purest({
    provider: 'google',
    api: 'drive'
  })

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
    self.websocket.send('uppy.debug', { message: 'we are good.' })
    self.websocket.send('google.list.ok', body)
  })
}
