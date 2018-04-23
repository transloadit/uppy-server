const Uploader = require('../Uploader')
const redis = require('redis')

function get (req, res) {
  const providerName = req.params.providerName
  const id = req.params.id
  const body = req.body
  const token = req.uppy.providerTokens[providerName]
  const provider = req.uppy.provider
  const { redisUrl, providerOptions } = req.uppy.options

  // get the file size before proceeding
  provider.size({ id, token }, (size) => {
    req.uppy.debugLog('Instantiating uploader.')
    const uploader = new Uploader({
      uppyOptions: req.uppy.options,
      endpoint: body.endpoint,
      uploadUrl: body.uploadUrl,
      protocol: body.protocol,
      metadata: body.metadata,
      size: size,
      fieldname: body.fieldname,
      pathPrefix: `${req.uppy.options.filePath}`,
      storage: redisUrl ? redis.createClient({ url: redisUrl }) : null,
      s3: req.uppy.s3Client ? {
        client: req.uppy.s3Client,
        options: providerOptions.s3
      } : null
    })

    // wait till the client has connected to the socket, before starting
    // the download, so that the client can receive all download/upload progress.
    req.uppy.debugLog('Waiting for socket connection before beginning remote download.')
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

module.exports = get
