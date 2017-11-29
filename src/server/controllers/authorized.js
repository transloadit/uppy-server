// checks if uppy-server is authorized to access a user's
// provider account.
// TODO: this function seems uneccessary. Might be better to just
// have this as a middleware that is used for all auth required routes.
function authorized ({ params, uppy }, res) {
  const providerName = params.providerName

  if (!uppy.providerTokens || !uppy.providerTokens[providerName]) {
    return res.json({ authenticated: false })
  }

  const token = uppy.providerTokens[providerName]
  uppy.provider.list({ token }, (err, response, body) => {
    const notAuthenticated = Boolean(err)
    return res.json({ authenticated: !notAuthenticated })
  })
}

exports = module.exports = authorized
