const Uploader = require('../Uploader')
const redis = require('redis')
const { hasMatch } = require('../utils')
const validator = require('validator')

function get (req, res) {
  if (!validData(req.body, req.uppy.options.debug)) {
    req.uppy.debugLog('Invalid request body detected. Exiting download/upload handler.')
    return res.status(400).json({ error: 'Invalid upload data' })
  }

  const providerName = req.params.providerName
  const id = req.params.id
  const body = req.body
  const token = req.uppy.providerTokens[providerName]
  const provider = req.uppy.provider
  const { redisUrl, uploadUrls } = req.uppy.options

  if (uploadUrls && body.endpoint && !hasMatch(body.endpoint, uploadUrls)) {
    req.uppy.debugLog('Unmatching upload endpoint detected. Exiting download/upload handler.')
    return res.status(400).json({ error: 'upload endpoint does not match the endpoints specified' })
  }

  // get the file size before proceeding
  provider.size({ id, token }, (size) => {
    console.log(size, typeof size)
    req.uppy.debugLog('Instantiating uploader.')
    const uploader = new Uploader({
      endpoint: body.endpoint,
      protocol: body.protocol,
      metadata: body.metadata,
      size: size,
      fieldname: body.fieldname,
      pathPrefix: `${req.uppy.options.filePath}`,
      pathSuffix: `${encodeURIComponent(id)}`,
      storage: redisUrl ? redis.createClient({ url: redisUrl }) : null
    })

    // wait till the client has connected to the socket, before starting
    // the download, so that the client can receive all download/upload progress.
    req.uppy.debugLog('Waiting for socket connection before beginning remote download.')
    // TODO: there's a potential bug here. We should check if "endpoint" is specified before
    // waiting for socketReady.
    uploader.onSocketReady(() => {
      req.uppy.debugLog('Socket connection received. Starting remote download.')
      provider.download({ id, token, query: req.query },
        size ? uploader.handleChunk.bind(uploader) : null,
        !size ? uploader.handleResponse.bind(uploader) : null)
    })
    const response = uploader.getResponse()
    res.status(response.status).json(response.body)
  })
}

const validData = (data, debugMode) => {
  if (data.endpoint) {
    return validator.isURL(data.endpoint, { require_protocol: true, require_tld: !debugMode })
  }

  return true
}

module.exports = get
