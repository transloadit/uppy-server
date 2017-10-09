function thumbnail (req, res) {
  const providerName = req.params.providerName
  const id = req.params.id
  const token = req.uppyProviderTokens[providerName]
  const provider = req.uppyProvider

  provider.thumbnail({ id, token }, (response) => response ? response.pipe(res) : res.sendStatus(404))
}

exports = module.exports = thumbnail
