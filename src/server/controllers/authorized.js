function authorized ({ params, session, uppyProvider }, res) {
  const providerName = params.providerName

  if (!session[providerName] || !session[providerName].token) {
    return res.json({ authenticated: false })
  }
  const provider = uppyProvider
  const token = session[providerName].token

  provider.list({ token }, (err, response, body) => {
    const notAuthenticated = Boolean(err)
    return res.json({ authenticated: !notAuthenticated })
  })
}

exports = module.exports = authorized
