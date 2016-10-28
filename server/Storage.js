var providers = {
  dropbox: require('./provider/dropbox'),
  drive: require('./provider/drive')
}

function Storage (options) {
  var id = options.provider

  if (!providers[id]) {
    throw new Error('Non-existing provider! -> ' + id)
  }

  return new providers[id](options)
}

exports = module.exports = Storage
