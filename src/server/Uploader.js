const fs = require('fs')
const path = require('path')
const tus = require('tus-js-client')
const uuid = require('uuid')
const emitter = require('./WebsocketEmitter')
const request = require('request')

class Uploader {
  constructor (options) {
    this.options = options
    this.token = uuid.v4()
    this.options.path = `${this.options.pathPrefix}/${this.token}-${this.options.pathSuffix}`
    this.writer = fs.createWriteStream(this.options.path)
    this.emittedProgress = 0
    this.storage = options.storage
  }

  onSocketReady (callback) {
    emitter.once(`connection:${this.token}`, () => callback())
  }

  cleanUp () {
    if (fs.existsSync(this.options.path)) {
      fs.unlink(this.options.path)
    }
    emitter.removeAllListeners(`pause:${this.token}`)
    emitter.removeAllListeners(`resume:${this.token}`)
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

  saveState (state) {
    if (!this.storage) return
    this.storage.set(this.token, JSON.stringify(state))
  }

  emitProgress (bytesUploaded, bytesTotal) {
    bytesTotal = bytesTotal || this.options.size
    const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
    console.log(bytesUploaded, bytesTotal, `${percentage}%`)

    const dataToEmit = {
      action: 'progress',
      payload: { progress: percentage, bytesUploaded, bytesTotal }
    }
    this.saveState(dataToEmit)

    // avoid flooding the client with progress events.
    const roundedPercentage = Math.floor(percentage)
    if (this.emittedProgress !== roundedPercentage) {
      this.emittedProgress = roundedPercentage
      emitter.emit(this.token, dataToEmit)
    }
  }

  emitSuccess (url) {
    const emitData = {
      action: 'success',
      payload: { complete: true, url }
    }
    this.saveState(emitData)
    emitter.emit(this.token, emitData)
  }

  emitError (err) {
    const dataToEmit = {
      action: 'error',
      payload: { error: err }
    }
    this.saveState(dataToEmit)
    emitter.emit(this.token, dataToEmit)
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
        uploader.emitError(error)
        // TODO: should the download file be deleted on error?
        //    How would we then handle retries.
        console.log(error)
      },
      onProgress (bytesUploaded, bytesTotal) {
        uploader.emitProgress(bytesUploaded, bytesTotal)
      },
      onChunkComplete (chunkSize, bytesUploaded, bytesTotal) {
        uploader.tus.options.chunkSize = uploader.writer.bytesWritten - bytesUploaded
      },
      onSuccess () {
        uploader.emitSuccess(uploader.tus.url)
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
    request.post({ url: this.options.endpoint, formData }, (error, response, body) => {
      if (error || response.statusCode >= 400) {
        console.log(`error: ${error} status: ${response.statusCode}`)
        this.emitError(error || response.statusMessage)
      } else {
        this.emitSuccess()
      }

      this.cleanUp()
    })
  }
}

exports = module.exports = Uploader
