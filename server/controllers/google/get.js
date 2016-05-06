var fs = require('fs')
var path = require('path')
var fileTypes = {
  'document': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx'],
  'presentation': ['application/vnd.openxmlformats-officedocument.presentationml.presentation', '.pptx'],
  'spreadsheet': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.xlsx']
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
    // First fetch file meta data, not actual file
    google.get(`files/${this.query.fileId}`, {
      auth: {
        bearer: this.session.google.token
      }
    }, function (err, res, file) {
      if (err) {
        throw err
      }
      // If file is Google document, need to download exported Office doc
      if (file.mimeType.indexOf('application/vnd.google-apps.') !== -1) {
        var fileType = fileTypes[file.mimeType.replace('application/vnd.google-apps.', '')]

        // Pass mimeType of desired file type to export
        google.get(`files/${self.query.fileId}/export`, {
          auth: {
            bearer: self.session.google.token
          },
          qs: {
            mimeType: fileType[0]
          }
        }, function (err, res, body) {
          if (err) {
            console.log(err)
            self.body = 'Error: ' + err
            return cb()
          }

          self.body = 'ok'
          self.status = 200
          cb()
        }).pipe(fs.createWriteStream('./output/' + file.title + fileType[1] || 'cat.png'))
      } else {
        // Fetch non-Google files
        google.get(`files/${file.id}`, {
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

          console.log('we did it')
          self.body = 'ok'
          self.status = 200
          cb()
        }).pipe(fs.createWriteStream('./output/' + file.title || 'cat.png'))
      }
    })
  }
}
