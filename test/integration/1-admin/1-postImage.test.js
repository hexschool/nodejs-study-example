const {
  describe, it, expect, afterEach, beforeEach, beforeAll, afterAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const path = require('path')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')

const route = '/api/v1/admin/upload'

describe(`POST ${route}`, () => {
  let server
  const testAdminUserInfo = {
    name: '測試管理者用戶45',
    email: 'admin@example.com',
    password: 'hexSchool12345'
  }
  let token
  beforeAll(async () => {
    server = await TestServer.getServer()
    const loginResult = await server
      .post('/api/v1/users/signin')
      .send({
        email: testAdminUserInfo.email,
        password: testAdminUserInfo.password
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    token = loginResult.body.data.token
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('新增圖片，回傳HTTP Code 200', async () => {
    const result = await server
      .post(route)
      .attach('file', path.resolve(__dirname, './test.png'))
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200)
    expect(typeof result.body.data.image_url).toBe('string')
    console.log(result.body.data.image_url)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(async () => {
    await TestServer.close()
  })
})
