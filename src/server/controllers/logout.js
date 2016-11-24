'use strict'

function * logout (next) {
  try {
    var session = this.session
    var providerName = this.params.providerName

    if (session[providerName]) {
      session[providerName].token = null
    }

    if (session.grant) {
      session.grant.state = null
      session.grant.dynamic = null
    }

    this.status = 200
    this.body = {
      ok: true
    }
  } catch (err) {
    this.status = 500
    this.body = {
      ok: false,
      error: err
    }
    // throw error
    console.log(err)
  }
}

exports = module.exports = logout
