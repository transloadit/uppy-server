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
