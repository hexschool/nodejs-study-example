const {
  describe, it, expect, afterEach, beforeEach, beforeAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/v1/admin/category'

describe(`POST ${route}`, () => {
  let server
  const testAdminUserInfo = {
    name: '測試管理者用戶45',
    email: 'admin@example.com',
    password: 'hexSchool12345'
  }
  const categoryInfo = {
    name: 'test'
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

  it('未帶入token，回傳HTTP Code 401', async () => {
    const result = await server
      .post(route)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.UNAUTHORIZED)
    expect(result.body.message).toEqual('你沒有權限存取此資源')
  })

  it('不輸入name，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({})
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的name，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        name: 1234
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('帶入正確的資訊，回傳HTTP Code 200', async () => {
    const result = await server
      .post(route)
      .send(categoryInfo)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.message).toEqual('新增成功')
  })

  it('帶入正確的資訊，回傳HTTP Code 200', async () => {
    const result = await server
      .post(route)
      .send({
        name: 'test2'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.message).toEqual('新增成功')
  })

  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .post(route)
      .send(categoryInfo)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(500)
    expect(result.body.message).toEqual('伺服器錯誤')
  })
  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })
  afterAll(async () => {
    await TestServer.close()
  })
})
