/**
 *
 * @param {string} value
 * @param {string[]} criteria
 */
module.exports.hasMatch = (value, criteria) => {
  return criteria.some((i) => {
    return value === i || (new RegExp(i)).test(value)
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
