const crypto = require('crypto')
const jwt = require('jsonwebtoken')

/**
 *
 * @param {*} payload
 * @param {string} secret
 */
module.exports.generateToken = (payload, secret) => {
  return encrypt(jwt.sign({data: payload}, secret, { expiresIn: 60 * 60 * 24 }), secret)
}

/**
 *
 * @param {string} token
 * @param {string} secret
 */
module.exports.verifyToken = (token, secret) => {
  try {
    // @ts-ignore
    return {payload: jwt.verify(decrypt(token, secret), secret, {}).data}
  } catch (err) {
    return {err}
  }
}

/**
 *
 * @param {object} res
 * @param {string} token
 * @param {object=} uppyOptions
 */
module.exports.addToCookies = (res, token, uppyOptions) => {
  const cookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 30, // would expire after 30 days
    httpOnly: true
  }

  if (uppyOptions.cookieDomain) {
    cookieOptions.domain = uppyOptions.cookieDomain
  }
  // send signed token to client.
  res.cookie('uppyAuthToken', token, cookieOptions)
}

const encrypt = (input, secret) => {
  const cipher = crypto.createCipher('aes256', secret)
  let encrypted = cipher.update(input, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

const decrypt = (encrypted, secret) => {
  var decipher = crypto.createDecipher('aes256', secret)
  var decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
