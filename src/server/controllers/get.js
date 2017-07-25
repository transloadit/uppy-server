const Uploader = require('../Uploader')

function get (req, res) {
  const providerName = req.params.providerName
  const id = req.params.id
  const body = req.body
  const token = req.session[providerName]
    ? req.session[providerName].token
    : body.token
  const provider = req.uppyProvider
  const uploader = new Uploader({
    endpoint: body.endpoint,
    protocol: body.protocol,
    metadata: body.metadata,
    size: body.size,
    fieldname: body.fieldname,
    path: `${process.env.UPPYSERVER_DATADIR}/${encodeURIComponent(id)}`,
    storage: req.session
  })

  uploader.onSocketReady(() => {
    provider.download({ id, token },
    body.size ? uploader.handleChunk.bind(uploader) : null,
    !body.size ? uploader.handleResponse.bind(uploader) : null)
  })
  const response = uploader.getResponse()
  return res.status(response.status).json(response.body)
}

exports = module.exports = get
