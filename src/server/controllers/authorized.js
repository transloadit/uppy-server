// TODO: this function seems uneccessary. Might be better to just
// have this as a middleware that is used for all auth required routes.

/**
 * checks if uppy-server is authorized to access a user's provider account.
 *
 * @param {object} req
 * @param {object} res
 */
function authorized (req, res) {
  const { params, uppy } = req
  const providerName = params.providerName

  if (!uppy.providerTokens || !uppy.providerTokens[providerName]) {
    return res.json({ authenticated: false })
  }

  const token = uppy.providerTokens[providerName]
  uppy.provider.list({ token }, (err, response, body) => {
    const notAuthenticated = Boolean(err)
    if (notAuthenticated) {
      console.log(`Provider:${providerName} failed authorizarion test err:${err}`)
    }
    return res.json({ authenticated: !notAuthenticated })
  })
}

module.exports = authorized
