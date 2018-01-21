const router = require('express').Router
const request = require('request')
const Uploader = require('../Uploader')
const validator = require('validator')
const utils = require('../utils')

module.exports = () => {
  return router()
    .post('/meta', meta)
    .post('/get', get)
}

/**
 * Fteches the size and content type of a URL
 *
 * @param {object} req expressJS request object
 * @param {object} res expressJS response object
 */
const meta = (req, res) => {
  req.uppy.debugLog('URL file import handler running')

  if (!validateData(req.body)) {
    req.uppy.debugLog('Invalid request body detected. Exiting url meta handler.')
    return res.status(400).json({error: 'Invalid request body'})
  }

  utils.getURLMeta(req.body.url)
    .then(res.json)
    .catch((err) => {
      console.error(err)
      return res.status(500).json({ error: err })
    })
}

// TODO: refactor this so it can be merged someway with ./get.js
/**
 * Handles the reques of import a file from a remote URL, and then
 * subsequently uploading it to the specified destination.
 *
 * @param {object} req expressJS request object
 * @param {object} res expressJS response object
 */
const get = (req, res) => {
  req.uppy.debugLog('URL file import handler running')

  if (!validateData(req.body)) {
    req.uppy.debugLog('Invalid request body detected. Exiting url download/upload handler.')
    return res.status(400).json({ error: 'Invalid request body' })
  }

  utils.getURLMeta(req.body.url)
    .then(({ size }) => {
      // @ts-ignore
      const { filePath } = req.uppy.options
      req.uppy.debugLog('Instantiating uploader.')
      const uploader = new Uploader({
        endpoint: req.body.endpoint,
        protocol: req.body.protocol,
        metadata: req.body.metadata,
        size: size,
        pathPrefix: `${filePath}`,
        pathSuffix: `${encodeURIComponent(req.body.url)}`
        // TODO: add redis client for golden retriever state storage
      })

      req.uppy.debugLog('Waiting for socket connection before beginning remote download.')
      uploader.onSocketReady(() => {
        req.uppy.debugLog('Socket connection received. Starting remote download.')
        downloadURL(req.body.url, uploader.handleChunk.bind(uploader))
      })

      const response = uploader.getResponse()
      res.status(response.status).json(response.body)
    }).catch((err) => {
      console.error(err)
      res.json({ err })
    })
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

  request(opts)
    .on('data', onDataChunk)
    .on('error', (err) => console.error(err))
}

/**
 * Validates if passed data contains valid content
 *
 * @param {object} data
 * @returns {boolean}
 */
const validateData = (data) => {
  if (data.endpoint && !validator.isURL(data.endpoint, { require_protocol: true })) {
    return false
  }

  if (data.url && !validator.isURL(data.url, { require_protocol: true })) {
    return false
  }

  return true
}
