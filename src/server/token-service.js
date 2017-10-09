const jwt = require('jsonwebtoken')

module.exports.generateToken = (payload, secret) => {
  return jwt.sign({data: payload}, secret, { expiresIn: 60 * 60 * 24 })
}

module.exports.verifyToken = (token, secret) => {
  try {
    return {payload: jwt.verify(token, secret, {}).data}
  } catch (err) {
    return {err}
  }
}

module.exports.setToken = (res, token) => {
  // send signed token to client.
  res.cookie('uppyAuthToken', token, {
    maxAge: 1000 * 60 * 60 * 24 * 30, // would expire after 30 days
    httpOnly: true
  })
}
