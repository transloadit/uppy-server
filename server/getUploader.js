var fs = require('fs')
var http = require('http')
var path = require('path')
var tus = require('tus-js-client')

function getUploader (options, cb, self) {
  var fpath = options.path
  var fname = options.name || path.basename(fpath)

  var writer = fs.createWriteStream(fpath)

  writer.on('finish', function () {
    if (!options.host) {
      self.status = 200
      self.statusText = 'File written to uppy server local storage'
      return cb()
    }

    if (options.protocol === 'tus') {
      var token = generateUUID()

      var file = fs.createReadStream(fpath)
      var size = fs.statSync(fpath).size

      var options = {
        endpoint: options.host,
        resume: true,
        metadata: {
          filename: fname
        },
        uploadSize: size,
        onError: function (error) {
          throw error
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
          console.log(bytesUploaded, bytesTotal, percentage + '%')

          // var emitData = JSON.stringify({
          //   action: 'progress',
          //   payload: {
          //     progress: percentage,
          //     bytesUploaded: bytesUploaded,
          //     bytesTotal: bytesTotal
          //   }
          // })

          // emitter.on('google:connection:' + token, function () {
          //   emitter.emit('google:' + token, emitData)
          // })

          // emitter.emit('google:' + token, emitData)
        },
        onSuccess: function () {
          console.log('Upload finished:', upload.url)
          // emitter.emit('google:' + token, JSON.stringify({
          //   action: 'progress',
          //   payload: {
          //     complete: true
          //   }
          // }))
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

    fs.readFile(fpath, function (err, data) {
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
            console.log('Transfer to server `' + options.host + '` was successful.')
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

exports = module.exports = getUploader
