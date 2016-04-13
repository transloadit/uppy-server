var fs = require('fs')

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
        // Pass mimeType of desired file type to export
        // TODO: Google Docs, Sheets, etc, need to be passed different mimeTypes.
        //       'application/...wordprocessingml.document' is for Google Docs files
        //
        // google.get(`files/${self.query.fileId}/export`, {
        //   auth: {
        //     bearer: self.session.google.token
        //   },
        //   qs: {
        //     mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        //   }
        // }, function (err, res, body) {
        //   if (err) {
        //     console.log(err)
        //     self.body = 'Error: ' + err
        //     return cb()
        //   }
        //
        //   fs.writeFile('./output/doc.docx', body, function (err, res) {
        //     if (err) {
        //       console.log(err)
        //       self.body = err
        //     }
        //     console.log('we did it')
        //     self.body = 'ok'
        //     self.status = 200
        //     cb()
        //   })
        // })
        self.status = 401
        self.body = 'Uppy Server does not currently support fetching Google documents'
        cb()
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
            console.log('fetcher')
            console.log(err)
            self.body = 'Error: ' + err
            return cb()
          }
          // TODO: Figure out how to write with correct encoding (binary?)
          fs.writeFile(`./output/${file.title}`, body, function (err, res) {
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
