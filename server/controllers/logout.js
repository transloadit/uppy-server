'use strict'

function * logout (next) {
  try {
    var provider = this.params.provider

    if (this.session[provider]) {
      this.session[provider].token = null
    }

    if (this.session.grant) {
      this.session.grant.state = null
      this.session.grant.dynamic = null
    }

    this.status = 200
    this.body = {
      ok: true
    }
  } catch (err) {
    this.status = 500
    this.body = {
      ok: false
    }

    // throw error
    console.log(err)
  }
}

exports = module.exports = logout
