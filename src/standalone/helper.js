// Reads all uppy-server configuration set via environment variables
// and builds them into an object which can be passed as options to
// the uppy.app method.
// TODO: Rename providerOptions to providers.
exports.getUppyOptions = () => {
  const uploadUrls = process.env.UPPYSERVER_UPLOAD_URLS

  return {
    providerOptions: {
      google: {
        key: process.env.UPPYSERVER_GOOGLE_KEY,
        secret: process.env.UPPYSERVER_GOOGLE_SECRET
      },
      dropbox: {
        key: process.env.UPPYSERVER_DROPBOX_KEY,
        secret: process.env.UPPYSERVER_DROPBOX_SECRET
      },
      instagram: {
        key: process.env.UPPYSERVER_INSTAGRAM_KEY,
        secret: process.env.UPPYSERVER_INSTAGRAM_SECRET
      },
      s3: {
        key: process.env.UPPYSERVER_AWS_KEY,
        secret: process.env.UPPYSERVER_AWS_SECRET,
        bucket: process.env.UPPYSERVER_AWS_BUCKET,
        region: process.env.UPPYSERVER_AWS_REGION
      }
    },
    server: {
      host: process.env.UPPYSERVER_DOMAIN,
      protocol: process.env.UPPYSERVER_PROTOCOL,
      path: process.env.UPPYSERVER_PATH || process.env.UPPYSERVER_IMPLICIT_PATH,
      oauthDomain: process.env.UPPYSERVER_OAUTH_DOMAIN,
      validHosts: (process.env.UPPYSERVER_DOMAINS || process.env.UPPYSERVER_DOMAIN).split(',')
    },
    filePath: process.env.UPPYSERVER_DATADIR,
    redisUrl: process.env.UPPYSERVER_REDIS_URL,
    sendSelfEndpoint: process.env.UPPYSERVER_SELF_ENDPOINT,
    uploadUrls: uploadUrls ? uploadUrls.split(',') : null,
    secret: process.env.UPPYSERVER_SECRET,
    debug: process.env.NODE_ENV !== 'production'
  }
}

// validates that the mandatory uppy-server options are set
// in the environment variables.
exports.validateConfig = () => {
  const mandatoryOptions = [
    'UPPYSERVER_SECRET',
    'UPPYSERVER_DATADIR',
    'UPPYSERVER_DOMAIN'
  ]
  /** @type {string[]} */
  const unspecified = []

  mandatoryOptions.forEach((i) => {
    if (!process.env[i]) unspecified.push(i)
  })
  if (unspecified.length) {
    console.error('\x1b[31m', 'Please specify the following environment',
      'variables to run uppy-server as Standalone:\n', unspecified.join(',\n'), '\x1b[0m')
    process.exit(1)
  }
}

/**
 *
 * @param {string} url
 */
exports.hasProtocol = (url) => {
  return url.startsWith('http://') || url.startsWith('https://')
}
