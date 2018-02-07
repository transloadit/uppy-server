const request = require('request')

/**
 *
 * @param {string} value
 * @param {string[]} criteria
 * @returns {boolean}
 */
exports.hasMatch = (value, criteria) => {
  return criteria.some((i) => {
    return value === i || (new RegExp(i)).test(value)
  })
}

/**
 *
 * @param {object} data
 * @returns {string}
 */
exports.jsonStringify = (data) => {
  const cache = []
  return JSON.stringify(data, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return
      }
      cache.push(value)
    }
    return value
  })
}

/**
 * Gets the size and content type of a url's content
 *
 * @param {string} url
 * @return {Promise}
 */
exports.getURLMeta = (url) => {
  return new Promise((resolve, reject) => {
    const opts = {
      uri: url,
      method: 'HEAD',
      followAllRedirects: true
    }

    request(opts, (err, response, body) => {
      if (err) {
        reject(err)
      } else {
        resolve({
          type: response.headers['content-type'],
          size: parseInt(response.headers['content-length'])
        })
      }
    })
  })
}

// all paths are assumed to be '/' prepended
/**
 * Returns a url builder
 *
 * @param {object} options uppy options
 */
const getURLBuilder = (options) => {
  /**
   * Builds uppy targeted url
   *
   * @param {string} path the tail path of the url
   * @param {boolean} isExternal if the url is for the external world
   * @param {boolean} excludeHost if the server domain and protocol should be included
   */
  const buildURL = (path, isExternal, excludeHost) => {
    let url = path
    // supports for no path specified too
    if (isExternal) {
      url = `${options.server.implicitPath || ''}${url}`
    }

    url = `${options.server.path || ''}${url}`

    if (!excludeHost) {
      url = `${options.server.protocol}://${options.server.host}${url}`
    }

    return url
  }

  return buildURL
}

module.exports.getURLBuilder = getURLBuilder
