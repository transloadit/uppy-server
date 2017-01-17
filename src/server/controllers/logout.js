function logout (req, res) {
  const session = req.session
  const providerName = req.params.providerName

  if (session[providerName]) {
    session[providerName].token = null
  }

  if (session.grant) {
    session.grant.state = null
    session.grant.dynamic = null
  }
  res.json({ ok: true })
}

exports = module.exports = logout
