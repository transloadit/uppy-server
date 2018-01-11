/**
 *
 * @param {string} value
 * @param {string[]} criteria
 * @returns {boolean}
 */
module.exports.hasMatch = (value, criteria) => {
  return criteria.some((i) => {
    return value === i || (new RegExp(i)).test(value)
  })
}

/**
 *
 * @param {object} data
 * @returns {string}
 */
module.exports.jsonStringify = (data) => {
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
