const fs = require('fs')
const path = require('path')
const tus = require('tus-js-client')
const generateUUID = require('./utils').generateUUID
const emitter = require('./WebsocketEmitter')
const request = require('request')

class Uploader {
  constructor (options) {
    this.options = options
    this.writer = fs.createWriteStream(options.path)
    this.token = generateUUID()
  }

  onSocketReady (callback) {
    emitter.on(`connection:${this.token}`, () => {
      callback()
    })
  }

  handleChunk (chunk) {
    this.writer.write(chunk, () => {
      if (!this.options.endpoint) {
        return
      }

      if (this.options.protocol === 'tus' && !this.tus) {
        return this.uploadTus()
      }

      if (this.options.protocol !== 'tus' && this.writer.bytesWritten === this.options.size) {
        return this.uploadMultipart()
      }
    })
  }

  getResponse () {
    const body = this.options.endpoint
      ? { token: this.token }
      : 'No endpoint, file written to uppy server local storage'

    return { body, status: 200 }
  }

  uploadTus () {
    const fname = this.options.name || path.basename(this.options.path)
    const file = fs.createReadStream(this.options.path)
    const uploader = this
    let emittedProgress = 0

    this.tus = new tus.Upload(file, {
      endpoint: this.options.endpoint,
      resume: true,
      uploadSize: this.options.size,
      metadata: { filename: fname },
      chunkSize: this.writer.bytesWritten,
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

        // avoid flooding the client with progress events.
        const roundedPercentage = Math.floor(percentage)
        if (emittedProgress !== roundedPercentage) {
          emittedProgress = roundedPercentage
          emitter.emit(uploader.token, emitData)
        }
      },
      onChunkComplete (chunkSize, bytesUploaded, bytesTotal) {
        uploader.tus.options.chunkSize = uploader.writer.bytesWritten - bytesUploaded
      },
      onSuccess () {
        emitter.emit(
          uploader.token,
          JSON.stringify({
            action: 'success',
            payload: { complete: true, url: uploader.tus.url }
          })
        )

        fs.unlink(uploader.options.path)
      }
    })

    this.tus.start()

    emitter.on(`pause:${this.token}`, () => {
      this.tus.abort()
    })

    emitter.on(`resume:${this.token}`, () => {
      this.tus.start()
    })
  }

  uploadMultipart () {
    fs.readFile(this.options.path, (err, data) => {
      if (err) {
        // socket send error message
        const emitData = JSON.stringify({
          action: 'error',
          payload: { error: 'bad file' }
        })

        fs.unlink(this.options.path)
        return emitter.emit(this.token, emitData)
      }

      // file key should be configurable
      request.post({ url: this.options.endpoint, file: data }, (err, response, body) => {
        let emitData = {}

        if (err) {
          emitData.action = 'error'
          emitData.payload = { error: err }
        } else {
          emitData.action = 'success'
          emitData.payload = { complete: true }
        }

        fs.unlink(this.options.path)
        return emitter.emit(this.token, JSON.stringify(emitData))
      })
    })
  }
}

exports = module.exports = Uploader
