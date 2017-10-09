function list ({ query, params, uppyProviderTokens, uppyProvider }, res, next) {
  const providerName = params.providerName
  const token = uppyProviderTokens[providerName]

  uppyProvider.list({ token, directory: params.id, query }, (err, resp, body) => {
    if (err) {
      return next(err)
    }
    return res.json(body)
  })
}

exports = module.exports = list
