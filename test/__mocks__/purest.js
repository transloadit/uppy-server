const fs = require('fs')

class MockPurest {
  constructor (options) {
    const methodsToMock = ['query', 'select', 'where', 'auth', 'get', 'put', 'post']
    methodsToMock.forEach((item) => {
      this[item] = () => this
    })
    this.options = options
  }

  request (done) {
    if (typeof done === 'function') {
      const responses = {
        dropbox: {
          hash: '0a9f95a989dd4b1851f0103c31e304ce',
          contents: [{ rev: 'f24234cd4' }]
        },
        drive: {
          kind: 'drive#fileList',
          etag: '"bcIyJ9A3gXa8oTYmz6nzAjQd-lY/eQc3WbZHkXpcItNyGKDuKXM_bNY"',
          items: [{ id: '0B2x-PmqQHSKdT013TE1VVjZ3TWs' }]
        }
      }
      const body = responses[this.options.providerName]
      done(null, { body }, body)
    }

    return this
  }

  on (evt, cb) {
    if (evt === 'response') {
      cb(fs.createReadStream('./README.md'))
    }
    return this
  }
}

module.exports = () => {
  return (options) => new MockPurest(options)
}
