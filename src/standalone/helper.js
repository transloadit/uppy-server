const fs = require('fs')
const merge = require('lodash.merge')

/**
 * Reads all uppy-server configuration set via environment variables
 * and via the config file path
 *
 * @returns {object}
 */
exports.getUppyOptions = () => {
  return merge({}, getConfigFromEnv(), getConfigFromFile())
}

/**
 * Loads the config from environment variables
 *
 * @returns {object}
 */
const getConfigFromEnv = () => {
  const uploadUrls = process.env.UPPYSERVER_UPLOAD_URLS
  const domains = process.env.UPPYSERVER_DOMAINS || process.env.UPPYSERVER_DOMAIN || null
  const validHosts = domains ? domains.split(',') : []

  return {
    // TODO: Rename providerOptions to providers.
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
      path: process.env.UPPYSERVER_PATH,
      implicitPath: process.env.UPPYSERVER_IMPLICIT_PATH,
      oauthDomain: process.env.UPPYSERVER_OAUTH_DOMAIN,
      validHosts: validHosts
    },
    filePath: process.env.UPPYSERVER_DATADIR,
    redisUrl: process.env.UPPYSERVER_REDIS_URL,
    sendSelfEndpoint: process.env.UPPYSERVER_SELF_ENDPOINT,
    uploadUrls: uploadUrls ? uploadUrls.split(',') : null,
    secret: process.env.UPPYSERVER_SECRET,
    debug: process.env.NODE_ENV !== 'production'
  }
}

/**
 * Loads the config from a file and returns it as an object
 *
 * @returns {object}
 */
const getConfigFromFile = () => {
  const path = getConfigPath()
  if (!path) return {}

  const rawdata = fs.readFileSync(getConfigPath())
  // TODO validate the json object fields to match the uppy config schema
  // @ts-ignore
  return JSON.parse(rawdata)
}

/**
 * Returns the config path specified via cli arguments
 *
 * @returns {string}
 */
const getConfigPath = () => {
  let configPath

  for (let i = process.argv.length - 1; i >= 0; i--) {
    const isConfigFlag = process.argv[i] === '-c' || process.argv[i] === '--config'
    const flagHasValue = i + 1 <= process.argv.length
    if (isConfigFlag && flagHasValue) {
      configPath = process.argv[i + 1]
      break
    }
  }

  return configPath
}

/**
 * validates that the mandatory uppy-server options are set.
 * If it is invalid, it will console an error of unset options and exits the process.
 * If it is valid, nothing happens.
 *
 * @param {object} config
 */
exports.validateConfig = (config) => {
  const mandatoryOptions = ['secret', 'filePath', 'server.host']
  /** @type {string[]} */
  const unspecified = []

  mandatoryOptions.forEach((i) => {
    const value = i.split('.').reduce((prev, curr) => prev[curr], config)

    if (!value) unspecified.push(`"${i}"`)
  })

  // vaidate that all required config is specified
  if (unspecified.length) {
    console.error('\x1b[31m', 'Please specify the following options',
      'to run uppy-server as Standalone:\n', unspecified.join(',\n'), '\x1b[0m')
    process.exit(1)
  }

  // validate that specified filePath is writeable/readable.
  // TODO: consider moving this into the uppy module itself.
  try {
    // @ts-ignore
    fs.accessSync(`${config.filePath}`, fs.R_OK | fs.W_OK)
  } catch (err) {
    console.error('\x1b[31m', `No access to "${config.filePath}".`,
      'Please ensure the directory exists and with read/write permissions.', '\x1b[0m')
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
