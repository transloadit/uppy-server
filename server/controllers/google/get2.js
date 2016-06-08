var fs = require('fs')
var http = require('http')

var googleFileTypes = {
  document: {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: '.docx'
  },
  presentation: {
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extension: '.pptx'
  },
  spreadsheet: {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: '.xlsx'
  }
}

function isGoogleFile (file) {
  return file.mimeType.indexOf('application/vnd.google-apps.') !== -1
}

function getFileExtension (type) {
  var fileType = googleFileTypes[type.replace('application/vnd.google-apps.', '')]
  if (!fileType) return

  return fileType.extension
}

function getFileMimeType (type) {
  var fileType = googleFileTypes[type.replace('application/vnd.google-apps.', '')]
  if (!fileType) return

  return fileType.mimeType
}

function getUploadStream (opts, cb, self) {
  var writer = fs.createWriteStream(opts.fileName)

  writer.on('finish', function () {
    if (opts.target) {
      fs.readFile(opts.fileName, function (err, data) {
        if (err) {
          console.log(err)
          return
        }

        var req = http.request({
          host: opts.target,
          method: 'POST',
          'Content-Type': 'multipart/form-data',
          'Content-Length': data.length
        }, (res) => {
          console.log(`STATUS: ${res.statusCode}`)
          console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
          res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`)
          })

          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode <= 300) {
              self.status = res.status
              self.statusCode = res.statusCode
              return cb()
            }
            console.log('No more data in response.')
          })
        })

        req.on('error', (e) => {
          console.log(`problem with request: ${e.message}`)
        })

        req.write(data)
        req.end()
      })
    } else {
      self.status = 200
      self.statusText = 'File written to uppy server local storage'
      return cb()
    }
  })

  return writer
}

/**
 * Fetch a file from Google Drive
 */
module.exports = function * (next) {
  var self = this
  var Purest = require('purest')
  var google = new Purest({
    provider: 'google',
    api: 'drive',
    promise: true,
    defaults: {
      auth: {
        bearer: this.session.google.token
      }
    }
  })

  var fileId = this.request.body.fileId
  var target = this.request.body.target

  yield function getFile (cb) {
    if (!fileId) {
      console.log('invalid file id: ' + fileId)
      self.status = 400
      self.statusText = 'An invalid fileId was provided'
      return cb()
    }

    google.query()
      .get('files/' + fileId)
      .request((err, res, file) => {
        var writer
        var opts

        if (err) {
          self.status = 500
          self.statusText = 'There was an error fetching the file information.'
          return cb()
        }

        if (isGoogleFile(file)) {
          var mimeType = getFileMimeType(file.mimeType)
          var extension = getFileExtension(file.mimeType)

          opts = {
            fileName: './output/' + file.title + extension,
            target: target
          }

          if (!mimeType) {
            self.status = 500
            self.statusText = 'Uppy Server cannot export this type of file'
            return cb()
          }

          writer = getUploadStream(opts, cb, self)

          google.get('files/' + fileId + '/export', {
            qs: {
              mimeType: mimeType
            }
          }, (err, res, body) => {
            if (err) {
              self.status = res.status
              self.statusText = res.statusText
              return cb()
            }

            console.log('Saving exported file with content-type: `' + res.headers['content-type'] + '` as export mimeType `' + mimeType + '` to `./output/' + file.title + extension + '`')
          })
          .pipe(writer)
        } else {
          opts = {
            fileName: './output/' + file.title,
            target: target
          }

          writer = getUploadStream(opts, cb, self)

          google.get('files/' + fileId, {
            qs: {
              alt: 'media'
            }
          }, (err, res, body) => {
            if (err) {
              self.status = res.status
              self.statusText = res.statusText
              return cb()
            }

            console.log('Saving regular file with content-type: `' + res.headers['content-type'] + '` to `./output/' + file.title + '`')
          })
          .pipe(writer)
        }
      })
  }
}
