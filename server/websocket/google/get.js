var fs = require('fs')
var http = require('http')
var tus = require('tus-js-client')
var path = require('path')

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

function getUploadStream (opts, self) {
  var writer = fs.createWriteStream(opts.fileName)

  writer.on('finish', function () {
    if (!opts.target) {
      self.status = 200
      self.statusText = 'File written to uppy server local storage'
      return
    }

    if (opts.protocol === 'tus') {
      var filePath = opts.fileName
      var file = fs.createReadStream(filePath)
      var size = fs.statSync(filePath).size
      var options = {
        endpoint: opts.target,
        resume: true,
        metadata: {
          filename: path.basename(opts.fileName)
        },
        uploadSize: size,
        onError: function (error) {
          throw error
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
          console.log(bytesUploaded, bytesTotal, percentage + '%')
        },
        onSuccess: function () {
          console.log('Upload finished:', upload.url)
        }
      }

      var upload = new tus.Upload(file, options)
      upload.start()
    }

    fs.readFile(opts.fileName, function (err, data) {
      if (err) {
        console.log(err)
        return
      }

      var req = http.request({
        host: 'api2.transloadit.com',
        method: 'POST',
        'Content-Type': 'multipart/form-data',
        'Content-Length': data.length
      }, (res) => {
        console.log('STATUS:', res.statusCode)
        console.log('HEADERS:', JSON.stringify(res.headers, null, '\t'))

        res.on('data', (chunk) => {
          console.log('BODY:', chunk)
        })

        res.on('end', () => {
          console.log('No more data in response.')
          self.websocket.send('upload-complete', {
            statusCode: res.statusCode
          })
          if (res.status) {
          }

          if (res.statusCode >= 200 && res.statusCode <= 300) {
            // Server logging
            console.log('Transfer to server `' + opts.target + '` was successful.')
            console.log('Status code: ', res.statusCode)

            return
          }

          // Server logging
          console.log('Status Code was not between 200-300.  There was an error: ')
          console.log('response status code:', res.statusCode)
          console.log('response status:')
          console.log(res.status)

          return
        })
      })

      req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`)
      })

      req.write(data)
      req.end()
    })
  })

  return writer
}

/**
 * Fetch a file from Google Drive
 */
module.exports = function (data) {
  var Purest = require('purest')
  var google = new Purest({
    provider: 'google',
    api: 'drive',
    defaults: {
      auth: {
        bearer: this.session.google.token
      }
    }
  })

  var id = data.id
  var target = data.target

  if (!id) {
    console.log('invalid file id: ' + id)
    return
  }

  google.query()
    .get('files/' + id)
    .request((err, res, file) => {
      var writer
      var opts

      if (err) {
        return
      }

      if (isGoogleFile(file)) {
        var mimeType = getFileMimeType(file.mimeType)
        var extension = getFileExtension(file.mimeType)

        if (!mimeType) {
          return
        }

        opts = {
          fileName: './output/' + file.title + extension,
          target: target,
          protocol: data.protocol
        }

        writer = getUploadStream(opts, this)

        google.get('files/' + id + '/export', {
          qs: {
            mimeType: mimeType
          }
        }, (err, res, body) => {
          if (err) {
            return err
          }

          console.log('Saving exported file with content-type: `' + res.headers['content-type'] + '` as export mimeType `' + mimeType + '` to `./output/' + file.title + extension + '`')
        })
        .pipe(writer)
      } else {
        opts = {
          fileName: './output/' + file.title,
          target: target
        }

        writer = getUploadStream(opts, this)

        google.get('files/' + id, {
          qs: {
            alt: 'media'
          }
        }, (err, res, body) => {
          if (err) {
            return
          }

          console.log('Saving regular file with content-type: `' + res.headers['content-type'] + '` to `./output/' + file.title + '`')
        })
        .pipe(writer)
      }
    })
}
