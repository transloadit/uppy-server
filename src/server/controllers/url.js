const router = require('express').Router
const Uploader = require('../Uploader')
const redis = require('redis')
const { hasMatch } = require('../utils')
const validator = require('validator')
const request = require('request')

module.exports = function url (config) {
  const routes = router()
  routes.post('/meta', (req, res, next) => {
    const body = req.body
    const url = body.url

    console.log('URLLLLL', url)
    console.log(body)

    const opts = {
      uri: url,
      method: 'HEAD',
      followAllRedirects: true
    }

    request(opts, (error, response, body) => {
      // console.log(response, body, error)
      console.log(error)
      console.log(response.headers)

      res.json({
        type: response.headers['content-type'],
        size: response.headers['content-length']
      })
    })
  })

  routes.post('/get', (req, res, next) => {
    if (!validData(req.body)) {
      return res.sendStatus(400)
    }

    // const body = req.body

    // mock body
    const body = {
      id: 'https://uppy.io/images/blog/0.8/metadata-dashboard.jpg',
      protocol: 'tus',
      endpoint: 'https://master.tus.io/files/',
      metadata: {
        field: 'bla'
      },
      fieldname: 'metaFieldName[]',
      size: 75581
    }

    console.log('YO', req.uppy.options)

    const { redisUrl, uploadUrls, filePath } = req.uppy.options

    if (uploadUrls && body.endpoint && !hasMatch(body.endpoint, uploadUrls)) {
      return res.sendStatus(400)
    }

    const uploader = new Uploader({
      endpoint: body.endpoint,
      protocol: body.protocol,
      metadata: body.metadata,
      size: body.size,
      fieldname: body.fieldname,
      pathPrefix: `${filePath}`,
      pathSuffix: `${encodeURIComponent(body.id)}`,
      storage: redisUrl ? redis.createClient({ url: redisUrl }) : null
    })

    // wait till the client has connected to the socket, before starting
    // the download, so that the client can receive all download/upload progress.
    downloadURL(body.id,
      body.size ? uploader.handleChunk.bind(uploader) : null,
      uploader.handleResponse.bind(uploader))
    // uploader.onSocketReady(() => {
    //   downloadURL(body.url,
    //     body.size ? uploader.handleChunk.bind(uploader) : null,
    //     !body.size ? uploader.handleResponse.bind(uploader) : null)
    // })

    const response = uploader.getResponse()
    return res.status(response.status).json(response.body)
  })

  return routes
}

const downloadURL = (url, handleChunk, handleResponse) => {
  const opts = {
    uri: url,
    method: 'GET',
    followAllRedirects: true
  }

  request(opts)
    .on('data', handleChunk)
}

const validData = (data) => {
  if (data.size) {
    return !isNaN(data.size)
  }

  if (data.endpoint) {
    return validator.isURL(data.endpoint, { require_protocol: true })
  }

  return true
}
