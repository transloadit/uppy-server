var fs = require('fs')
var http = require('http')

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

  console.log(self.request.body.target)

  yield function getFile (cb) {
    var url = `files/${self.request.body.fileId}`
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

        var exportWriter = fs.createWriteStream('./output/' + file.title + fileType[1] || 'cat.png')
        exportWriter.on('finish', function () {
          fs.readFile('./output/' + file.title + fileType[1], function (err, data) {
            if (err) { console.log(err) }

            var req = http.request({
              host: self.request.body.target,
              method: 'POST',
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': data.length
            }, (res) => {
              console.log(`STATUS: ${res.statusCode}`)
              console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
              res.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`)
              })

              res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode <= 300) {
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
          // fs.createReadStream('./output/' + file.title + fileType[1] || 'cat.png')
          // .pipe(http.request({
          //   host: self.request.body.target,
          //   method: 'POST',
          //   'Content-Type': 'application/x-www-form-urlencoded',
          //   'Content-Length': ''
          // }, (res) => {
          //   console.log(res)
          // }))
        })
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
        })
        .pipe(exportWriter)
      } else {
        var writer = fs.createWriteStream('./output/' + file.title || 'cat.png')
        writer.on('finish', function () {
          fs.createReadStream('./output/' + file.title || 'cat.png')
          .pipe(http.request({
            host: self.request.body.target,
            method: 'POST',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': '1000'
          }, (res) => {
            console.log(res.statusCode)
          }))
        })
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
        }).pipe(writer)
      }
    })
  }
}
