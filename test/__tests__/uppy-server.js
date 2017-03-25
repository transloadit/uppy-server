/*global jest:false, test:false, expect:false, describe:false*/

jest.mock('tus-js-client')
jest.mock('purest')

const request = require('supertest')
const { authServer, noAuthServer } = require('../mockserver')

describe('list provider files', () => {
  test('list files for dropbox', () => {
    return request(authServer)
      .get('/dropbox/list/')
      .expect(200)
      .then((res) => expect(res.body.hash).toBe('0a9f95a989dd4b1851f0103c31e304ce'))
  })

  test('list files for google drive', () => {
    return request(authServer)
      .get('/drive/list/')
      .expect(200)
      .then((res) => expect(res.body.etag).toBe('"bcIyJ9A3gXa8oTYmz6nzAjQd-lY/eQc3WbZHkXpcItNyGKDuKXM_bNY"'))
  })
})

describe('download provdier file', () => {
  test('specified file gets downloaded from provider', () => {
    return request(authServer)
      .post('/drive/get/README.md')
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
      // see mockserver.js
      .expect('Location', 'http://redirect.foo')
  })

  test('check for authenticated provider', () => {
    request(authServer)
      .get('/drive/auth/')
      .expect(200)
      .then((res) => expect(res.body.authenticated).toBe(true))

    request(noAuthServer)
      .get('/drive/auth/')
      .expect(200)
      .then((res) => expect(res.body.authenticated).toBe(false))
  })

  test('logout provider', () => {
    return request(authServer)
      .get('/drive/logout/')
      .expect(200)
      .then((res) => expect(res.body.ok).toBe(true))
  })
})
