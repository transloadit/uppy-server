const fs = require('fs')
const path = require('path')
const tus = require('tus-js-client')
const uuid = require('uuid')
const emitter = require('./WebsocketEmitter')
const request = require('request')

class Uploader {
  constructor (options) {
    this.options = options
    this.writer = fs.createWriteStream(options.path)
    this.token = uuid.v4()
    this.emittedProgress = 0
    this.state = {
      action: 'start',
      payload: { progress: 0, bytesUploaded: 0 }
    }
    this.storage = options.storage
    this.storage.uploads = this.storage.uploads || {}
    this.storage.uploads[this.token] = this.state
    this._socketConnectionHandlers = []
  }

  onSocketReady (callback) {
    const handler = () => callback()
    emitter.on(`connection:${this.token}`, handler)
    this._socketConnectionHandlers.push(handler)
  }

  cleanUp () {
    if (fs.existsSync(this.options.path)) {
      fs.unlink(this.options.path)
    }

    while (this._socketConnectionHandlers.length) {
      const handler = this._socketConnectionHandlers.pop()
      emitter.removeListener(`connection:${this.token}`, handler)
    }
  }

  handleChunk (chunk) {
    this.writer.write(chunk, () => {
      if (!this.options.endpoint) return

      if (this.options.protocol === 'tus' && !this.tus) {
        return this.uploadTus()
      }

      if (this.options.protocol !== 'tus' && this.writer.bytesWritten === this.options.size) {
        return this.uploadMultipart()
      }
    })
  }

  handleResponse (resp) {
    resp.pipe(this.writer)
    this.writer.on('finish', () => {
      if (!this.options.endpoint) return

      this.options.protocol === 'tus' ? this.uploadTus() : this.uploadMultipart()
    })
  }

  getResponse () {
    const body = this.options.endpoint
      ? { token: this.token }
      : 'No endpoint, file written to uppy server local storage'

    return { body, status: 200 }
  }

  setState (state) {
    this.storage.uploads[this.token] = state
    this.storage.save()
  }

  emitProgress (bytesUploaded, bytesTotal) {
    bytesTotal = bytesTotal || this.options.size
    const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
    console.log(bytesUploaded, bytesTotal, `${percentage}%`)

    const emitData = {
      action: 'progress',
      payload: { progress: percentage, bytesUploaded, bytesTotal }
    }
    this.setState(emitData)

    // avoid flooding the client with progress events.
    const roundedPercentage = Math.floor(percentage)
    if (this.emittedProgress !== roundedPercentage) {
      this.emittedProgress = roundedPercentage
      emitter.emit(this.token, emitData)
    }
  }

  uploadTus () {
    const fname = this.options.name || path.basename(this.options.path)
    const metadata = Object.assign({ filename: fname }, this.options.metadata || {})
    const file = fs.createReadStream(this.options.path)
    const uploader = this

    this.tus = new tus.Upload(file, {
      endpoint: this.options.endpoint,
      resume: true,
      uploadSize: this.options.size || fs.statSync(this.options.path).size,
      metadata,
      chunkSize: this.writer.bytesWritten,
      onError (error) {
        uploader.cleanUp()
        console.log(error)
      },
      onProgress (bytesUploaded, bytesTotal) {
        uploader.emitProgress(bytesUploaded, bytesTotal)
      },
      onChunkComplete (chunkSize, bytesUploaded, bytesTotal) {
        uploader.tus.options.chunkSize = uploader.writer.bytesWritten - bytesUploaded
      },
      onSuccess () {
        const emtiData = {
          action: 'success',
          payload: { complete: true, url: uploader.tus.url }
        }
        uploader.setState(emtiData)
        emitter.emit(uploader.token, emtiData)
        uploader.cleanUp()
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
    const file = fs.createReadStream(this.options.path)

    // upload progress
    let bytesUploaded = 0
    file.on('data', (data) => {
      bytesUploaded += data.length
      this.emitProgress(bytesUploaded)
    })

    const formData = { [this.options.fieldname]: file }
    request.post({ url: this.options.endpoint, formData }, (err, response, body) => {
      let emitData = {}

      if (err) {
        emitData.action = 'error'
        emitData.payload = { error: err }
      } else {
        emitData.action = 'success'
        emitData.payload = { complete: true }
      }

      this.setState(emitData)
      emitter.emit(this.token, emitData)
      this.cleanUp()
    })
  }
}

exports = module.exports = Uploader
