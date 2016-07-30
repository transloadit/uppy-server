var fs = require('fs')
var http = require('http')
var path = require('path')
var tus = require('tus-js-client')
var wss = require('../../../WebsocketServer')
var generateUUID = require('../../../utils/generateUUID')

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
    if (!opts.target) {
      self.status = 200
      self.statusText = 'File written to uppy server local storage'
      return cb()
    }

    if (opts.protocol === 'tus') {
      var token = generateUUID()
      console.log('tus upload')
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

          wss.emit('google:' + token, JSON.stringify({
            action: 'progress',
            payload: {
              progress: percentage,
              bytesUploaded: bytesUploaded,
              bytesTotal: bytesTotal
            }
          }))
        },
        onSuccess: function () {
          console.log('Upload finished:', upload.url)
          wss.emit('google:' + token, JSON.stringify({
            action: 'progress',
            payload: {
              fileId: 'foo',
              complete: true
            }
          }))
        }
      }

      var upload = new tus.Upload(file, options)
      upload.start()
      self.body = {
        token: token
      }
      self.status = 200
      return cb()
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

          if (res.status) {
            self.status = res.status
          }

          if (res.statusCode >= 200 && res.statusCode <= 300) {
            // Server logging
            console.log('Transfer to server `' + opts.target + '` was successful.')
            console.log('Status code: ', res.statusCode)

            self.status = res.statusCode
            return cb()
          }

          // Server logging
          console.log('Status Code was not between 200-300.  There was an error: ')
          console.log('response status code:', res.statusCode)
          console.log('response status:')
          console.log(res.status)

          self.status = res.statusCode
          return cb()
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
module.exports = function * (next) {
  var self = this
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

  var fileId = this.request.body.fileId
  var target = this.request.body.target
  var protocol = this.request.body.protocol

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

          if (!mimeType) {
            self.status = 500
            self.statusText = 'Uppy Server cannot export this type of file'
            return cb()
          }

          opts = {
            fileName: './output/' + file.title + extension,
            target: target,
            protocol: protocol
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
            target: target,
            protocol: protocol
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

            // var token = helpers.generate
            // return cb()

            console.log('Saving regular file with content-type: `' + res.headers['content-type'] + '` to `./output/' + file.title + '`')
          })
          .pipe(writer)
        }
      })
  }
}
