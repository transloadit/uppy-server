const jwt = require('jsonwebtoken')

/**
 *
 * @param {*} payload
 * @param {string} secret
 */
module.exports.generateToken = (payload, secret) => {
  return jwt.sign({data: payload}, secret, { expiresIn: 60 * 60 * 24 })
}

/**
 *
 * @param {string} token
 * @param {string} secret
 */
module.exports.verifyToken = (token, secret) => {
  try {
    // @ts-ignore
    return {payload: jwt.verify(token, secret, {}).data}
  } catch (err) {
    return {err}
  }
}

/**
 *
 * @param {object} res
 * @param {string} token
 */
module.exports.setToken = (res, token) => {
  // send signed token to client.
  res.cookie('uppyAuthToken', token, {
    maxAge: 1000 * 60 * 60 * 24 * 30, // would expire after 30 days
    httpOnly: true
  })
}
