var fs = require('fs')

var fileTypes = {
  'document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

/**
 * Fetch a file from Google Drive
 */
module.exports = function * (next) {
  var self = this
  var Purest = require('purest')
  var google = new Purest({
    provider: 'google',
    api: 'drive'
  })

  yield function getFile (cb) {
    var url = `files/${this.query.fileId}`
    // First fetch file meta data, not actual file
    google.get(url, {
      auth: {
        bearer: this.session.google.token
      }
    }, function (err, res, file) {
      if (err) {
        throw new Error(`Could not retrieve '${url}' from Google Drive. ${err}`)
      }

      var filepath = `./output/${self.query.fileId}`

      // If file is Google document, need to download exported Office doc
      if (file.mimeType.indexOf('application/vnd.google-apps.') !== -1) {
        var exportMimeType = fileTypes[file.mimeType.replace('application/vnd.google-apps.', '')]

        // Pass mimeType of desired file type to export
        google.get(`files/${self.query.fileId}/export`, {
          auth: {
            bearer: self.session.google.token
          },
          qs: {
            mimeType: exportMimeType
          }
        }, function (err, res, body) {
          if (err) {
            console.log(err)
            self.body = 'Error: ' + err
            return cb()
          }

          console.log(`Saving exported file with content-type: '${res.headers['content-type']}' as exportMime '${exportMimeType}' to '${filepath}'`)

          fs.writeFile(filepath, body, 'utf8', function (err, res) {
            if (err) {
              console.log(err)
              self.body = err
            }
            self.body = 'ok'
            self.status = 200
            cb()
          })
        })
      } else {
        // Fetch non-Google files
        google.get(`files/${self.query.fileId}`, {
          auth: {
            bearer: self.session.google.token
          },
          qs: {
            alt: 'media'
          }
        }, function (err, res, body) {
          if (err) {
            console.log(err)
            self.body = 'Error: ' + err
            return cb()
          }

          console.log(`Saving regular file with content-type: '${res.headers['content-type']}' to '${filepath}'`)

          fs.writeFile(filepath, body, 'utf8', function (err, res) {
            if (err) {
              console.log(err)
              self.body = err
            }
            console.log('we did it')
            self.body = 'ok'
            self.status = 200
            cb()
          })
        })
      }
    })
  }
}
