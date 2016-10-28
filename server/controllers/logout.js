'use strict'

function * logout (next) {
  try {
    var session = this.session
    var provider = this.params.provider

    if (session[provider]) {
      session[provider].token = null
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
