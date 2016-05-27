var fs = require('fs')

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
    var url = `files/${this.request.body.fileId}`
    // First fetch file meta data, not actual file
    google.get(url, {
      auth: {
        bearer: this.session.google.token
      }
    }, function (err, res, file) {
      if (err) {
        console.log(`Error: Could not retrieve '${url}' from Google Drive. ${err}`)
        this.status = 500
        this.statusText = err
        return cb()
      }

      // If file is Google document, need to download exported Office doc
      if (file.mimeType.indexOf('application/vnd.google-apps.') !== -1) {
        var fileType = fileTypes[file.mimeType.replace('application/vnd.google-apps.', '')]
        if (!fileType) {
          self.status = 500
          self.statusText = 'File type not recognized.'
          return cb()
        }

        // Pass mimeType of desired file type to export
        google.get(`${url}/export`, {
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

          console.log(`Saving exported file with content-type: '${res.headers['content-type']}' as exportMime '${fileType[0]}' to './output/${file.title}${fileType[1]}'`)
          self.body = 'ok'
          self.status = 200
          cb()
        }).pipe(fs.createWriteStream('./output/' + file.title + fileType[1] || 'cat.png'))
      } else {
        // Fetch non-Google files
        google.get(`${url}`, {
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

          console.log(`Saving regular file with content-type: '${res.headers['content-type']}' to './output/${file.title}'`)
          self.body = 'ok'
          self.status = 200
          cb()
        }).pipe(fs.createWriteStream('./output/' + file.title || 'cat.png'))
      }
    })
  }
}
