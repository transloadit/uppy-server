const router = require('express').Router
const request = require('request')
const Uploader = require('../Uploader')

module.exports = () => {
  return router()
    .post('/meta', meta)
    .post('/get', get)
}

const meta = (req, res) => {
  // TODO: validate the body content
  const opts = {
    uri: req.body.url,
    method: 'HEAD',
    followAllRedirects: true
  }

  request(opts, (err, response, body) => {
    if (err) {
      console.error(err)
      return res.json({ err })
    }

    res.json({
      type: response.headers['content-type'],
      size: response.headers['content-length']
    })
  })
}

const get = (req, res) => {
  // TODO: validate body content
  // @ts-ignore
  const { filePath } = req.uppy.options
  const uploader = new Uploader({
    endpoint: req.body.endpoint,
    protocol: req.body.protocol,
    metadata: req.body.metadata,
    size: req.body.size,
    pathPrefix: `${filePath}`,
    pathSuffix: `${encodeURIComponent(req.body.url)}`
  })

  uploader.onSocketReady(() => {
    downloadURL(req.body.url, uploader.handleChunk.bind(uploader))
  })

  const response = uploader.getResponse()
  return res.status(response.status).json(response.body)
}

/**
 * Downloads the content in the specified url, and passes the data
 * to the callback chunk by chunk.
 *
 * @param {string} url
 * @param {function} onDataChunk
 */
const downloadURL = (url, onDataChunk) => {
  const opts = {
    uri: url,
    method: 'GET',
    followAllRedirects: true
  }

  request(opts).on('data', onDataChunk)
}
