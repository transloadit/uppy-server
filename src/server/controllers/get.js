const Uploader = require('../Uploader')
const redis = require('redis')

function get (req, res) {
  const providerName = req.params.providerName
  const id = req.params.id
  const body = req.body
  const token = req.session[providerName]
    ? req.session[providerName].token
    : body.token
  const provider = req.uppyProvider
  const { redisUrl } = req.uppyOptions
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
    provider.download({ id, token },
    body.size ? uploader.handleChunk.bind(uploader) : null,
    !body.size ? uploader.handleResponse.bind(uploader) : null)

    uploader.saveState({
      payload: { progress: 0, bytesUploaded: 0 }
    })
  })
  const response = uploader.getResponse()
  return res.status(response.status).json(response.body)
}

exports = module.exports = get
