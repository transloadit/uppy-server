/* global jest:false, test:false, expect:false, describe:false */

jest.mock('tus-js-client')
jest.mock('purest')

const request = require('supertest')
const tokenService = require('../../src/server/token-service')
const { authServer, noAuthServer } = require('../mockserver')
const authData = {
  dropbox: 'token value',
  drive: 'token value'
}
const token = tokenService.generateToken(authData, process.env.UPPYSERVER_SECRET)

describe('set i-am header', () => {
  test('set i-am header in response', () => {
    return request(authServer)
      .get('/dropbox/list/')
      .set('Cookie', `uppyAuthToken=${token}`)
      .expect(200)
      .then((res) => expect(res.header['i-am']).toBe('http://localhost:3020'))
  })
})

describe('list provider files', () => {
  test('list files for dropbox', () => {
    return request(authServer)
      .get('/dropbox/list/')
      .set('Cookie', `uppyAuthToken=${token}`)
      .expect(200)
      .then((res) => expect(res.body.hash).toBe('0a9f95a989dd4b1851f0103c31e304ce'))
  })

  test('list files for google drive', () => {
    return request(authServer)
      .get('/drive/list/')
      .set('Cookie', `uppyAuthToken=${token}`)
      .expect(200)
      .then((res) => expect(res.body.etag).toBe('"bcIyJ9A3gXa8oTYmz6nzAjQd-lY/eQc3WbZHkXpcItNyGKDuKXM_bNY"'))
  })
})

describe('download provdier file', () => {
  test('specified file gets downloaded from provider', () => {
    return request(authServer)
      .post('/drive/get/README.md')
      .set('Cookie', `uppyAuthToken=${token}`)
      .set('Content-Type', 'application/json')
      .send({
        endpoint: 'http://master.tus.com/files',
        protocol: 'tus'
      })
      .expect(200)
      .then((res) => expect(res.body.token).toBeTruthy())
  })
})

describe('test authentication', () => {
  test('authentication callback redirects to specified url', () => {
    return request(authServer)
      .get('/drive/callback')
      .set('Cookie', `uppyAuthToken=${token}`)
      // see mockserver.js
      .expect('Location', 'http://redirect.foo')
  })

  test('check for authenticated provider', () => {
    request(authServer)
      .get('/drive/authorized/')
      .set('Cookie', `uppyAuthToken=${token}`)
      .expect(200)
      .then((res) => expect(res.body.authenticated).toBe(true))

    request(noAuthServer)
      .get('/drive/authorized/')
      .expect(200)
      .then((res) => expect(res.body.authenticated).toBe(false))
  })

  test('logout provider', () => {
    return request(authServer)
      .get('/drive/logout/')
      .set('Cookie', `uppyAuthToken=${token}`)
      .expect(200)
      .then((res) => expect(res.body.ok).toBe(true))
  })
})

describe('connect to provider', () => {
  test('connect to dropbox via grant.js endpoint', () => {
    return request(authServer)
      .get('/dropbox/connect?foo=bar')
      .set('Cookie', `uppyAuthToken=${token}`)
      .expect(302)
      .expect('Location', 'http://localhost:3020/connect/dropbox?foo=bar')
  })

  test('connect to drive via grant.js endpoint', () => {
    return request(authServer)
      .get('/drive/connect?foo=bar')
      .set('Cookie', `uppyAuthToken=${token}`)
      .expect(302)
      .expect('Location', 'http://localhost:3020/connect/google?foo=bar')
  })
})

describe('handle oauth redirect', () => {
  test('redirect to a valid uppy instance', () => {
    const state = Buffer.from(JSON.stringify({ uppyInstance: 'http://localhost:3020' })).toString('base64')
    return request(authServer)
      .get(`/dropbox/redirect?state=${state}`)
      .set('Cookie', `uppyAuthToken=${token}`)
      .expect(302)
      .expect('Location', `http://localhost:3020/connect/dropbox/callback?state=${encodeURIComponent(state)}`)
  })

  test('do not redirect to invalid uppy instances', () => {
    const state = Buffer.from(JSON.stringify({ uppyInstance: 'http://localhost:3452' })).toString('base64')
    return request(authServer)
      .get(`/dropbox/redirect?state=${state}`)
      .set('Cookie', `uppyAuthToken=${token}`)
      .expect(400)
  })
})
