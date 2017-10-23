const Uploader = require('../Uploader')
const redis = require('redis')
const { hasMatch } = require('../utils')
const validator = require('validator')

function get (req, res) {
  if (!validData(req.body)) {
    return res.sendStatus(400)
  }

  const providerName = req.params.providerName
  const id = req.params.id
  const body = req.body
  const token = req.uppyProviderTokens[providerName]
  const provider = req.uppyProvider
  const { redisUrl, uploadUrls } = req.uppyOptions

  if (uploadUrls && body.endpoint && !hasMatch(body.endpoint, uploadUrls)) {
    return res.sendStatus(400)
  }

  const uploader = new Uploader({
    endpoint: body.endpoint,
    protocol: body.protocol,
    metadata: body.metadata,
    size: body.size,
    fieldname: body.fieldname,
    pathPrefix: `${req.uppyOptions.filePath}`,
    pathSuffix: `${encodeURIComponent(id)}`,
    storage: redisUrl ? redis.createClient({ url: redisUrl }) : null
  })

  // wait till the client has connected to the socket, before starting
  // the download, so that the client can receive all download/upload progress.
  uploader.onSocketReady(() => {
    provider.download({ id, token, query: req.query },
      body.size ? uploader.handleChunk.bind(uploader) : null,
      !body.size ? uploader.handleResponse.bind(uploader) : null)
  })
  const response = uploader.getResponse()
  return res.status(response.status).json(response.body)
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
exports = module.exports = get
