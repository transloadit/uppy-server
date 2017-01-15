'use strict'

var utils = require('../utils')
var config = require('@purest/providers')
var Uploader = require('../Uploader')

function get (req, res) {
  var providerName = req.params.providerName
  var id = req.params.id
  var body = req.body
  var endpoint = body.endpoint
  var protocol = body.protocol
  var token = req.session[providerName] ? req.session[providerName].token : body.token
  var provider = utils.getProvider({ providerName, config })
  var uploader = new Uploader({ endpoint, protocol })

  uploader.on('finish', (data) => {
    return res.status(data.status).json(data.body)
  })

  provider.download({ id, token })
    .then((response) => {
      response.pipe(uploader.upload({ path: process.env.UPPYSERVER_DATADIR + '/' + encodeURIComponent(id) }))
    })
}

exports = module.exports = get
