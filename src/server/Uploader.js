const EventEmitter = require('events')
const fs = require('fs')
const http = require('http')
const path = require('path')
const tus = require('tus-js-client')
const generateUUID = require('./utils').generateUUID
const emitter = require('./WebsocketEmitter')

class Uploader extends EventEmitter {
  constructor (options) {
    super()
    this.options = options
  }

  upload (options) {
    const fpath = options.path
    const fname = options.name || path.basename(fpath)

    const writer = fs.createWriteStream(fpath)

    writer.on('finish', () => {
      if (!this.options.endpoint) {
        this.emit('finish', {
          body: 'No endpoint, file written to uppy server local storage',
          status: 200
        })
        return
      }

      if (this.options.protocol === 'tus') {
        const token = generateUUID()

        const file = fs.createReadStream(fpath)
        const size = fs.statSync(fpath).size

        const upload = new tus.Upload(file, {
          endpoint: this.options.endpoint,
          resume: true,
          metadata: { filename: fname },
          uploadSize: size,
          onError (error) {
            throw error
          },
          onProgress (bytesUploaded, bytesTotal) {
            const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
            console.log(bytesUploaded, bytesTotal, `${percentage}%`)

            const emitData = JSON.stringify({
              action: 'progress',
              payload: { progress: percentage, bytesUploaded, bytesTotal }
            })

            emitter.emit(token, emitData)
          },
          onSuccess () {
            emitter.emit(
              token,
              JSON.stringify({
                action: 'success',
                payload: { complete: true, url: upload.url }
              })
            )
          }
        })

        emitter.on(`connection:${token}`, () => {
          upload.start()
        })

        this.emit('finish', { body: { token }, status: 200 })
        return
      }

      fs.readFile(fpath, (err, data) => {
        if (err) {
          return this.emit('finish', { body: err, status: 500 })
        }

        const req = http.request(
          {
            host: this.options.endpoint,
            method: 'POST',
            'Content-Type': 'multipart/form-data',
            'Content-Length': data.length
          },
          (res) => {
            res.on('data', (chunk) => {})

            res.on('end', () => {
              let status

              if (res.status) {
                status = res.status
              }

              if (res.statusCode < 200 || res.statusCode > 300) {
                // Server logging
                console.log(
                  'Status Code was not between 200-300.  There was an error: '
                )
                console.log('response status code:', res.statusCode)
                console.log('response status:')
                console.log(res.status)

                return this.emit('finish', {
                  status: res.statusCode,
                  statusText: 'error',
                  body: 'no bueno'
                })
              }

              if (res.statusCode >= 200 && res.statusCode <= 300) {
                // Server logging
                console.log(
                  `Transfer to server '${this.options.endpoint}' was successful.`
                )
                console.log('Status code: ', res.statusCode)

                status = res.statusCode
                return this.emit('finish', { status, body: 'good job' })
              }
            })
          }
        )

        req.on('error', (error) => {
          console.log(`problem with request: ${error.message}`)
          this.emit('finish', { status: 500, body: error })
        })

        req.write(data)
        req.end()
      })
    })

    return writer
  }
}

exports = module.exports = Uploader
