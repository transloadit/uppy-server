const utils = require('../utils')
const config = require('@purest/providers')
const Uploader = require('../Uploader')

function get (req, res) {
  const providerName = req.params.providerName
  const id = req.params.id
  const body = req.body
  const endpoint = body.endpoint
  const protocol = body.protocol
  const token = req.session[providerName]
    ? req.session[providerName].token
    : body.token
  const provider = utils.getProvider({ providerName, config })
  const uploader = new Uploader({
    endpoint,
    protocol,
    size: body.size,
    path: `${process.env.UPPYSERVER_DATADIR}/${encodeURIComponent(id)}`
  })

  uploader.onSocketReady(() => {
    provider.download({ id, token }, uploader.handleChunk.bind(uploader))
  })
  const response = uploader.getResponse()
  return res.status(response.status).json(response.body)
}

exports = module.exports = get
