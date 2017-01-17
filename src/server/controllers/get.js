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
  const uploader = new Uploader({ endpoint, protocol })

  uploader.on('finish', (data) => {
    return res.status(data.status).json(data.body)
  })

  provider.download({ id, token }).then((response) => {
    response.pipe(
      uploader.upload({
        path: `${process.env.UPPYSERVER_DATADIR}/${encodeURIComponent(id)}`
      })
    )
  })
}

exports = module.exports = get
