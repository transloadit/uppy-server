const Uploader = require('../Uploader')
const redis = require('redis')
const { hasMatch } = require('../utils')

function get (req, res) {
  const providerName = req.params.providerName
  const id = req.params.id
  const body = req.body
  const token = req.session[providerName]
    ? req.session[providerName].token
    : body.token
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

  uploader.onSocketReady(() => {
    provider.download({ id, token, query: req.query },
    body.size ? uploader.handleChunk.bind(uploader) : null,
    !body.size ? uploader.handleResponse.bind(uploader) : null)
  })
  const response = uploader.getResponse()
  return res.status(response.status).json(response.body)
}

exports = module.exports = get
