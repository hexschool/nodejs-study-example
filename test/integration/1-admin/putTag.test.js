const {
  describe, it, expect, afterEach, beforeEach, beforeAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/v1/admin/tags/:tags_id'

describe(`PUT ${route}`, () => {
  let server
  const testAdminUserInfo = {
    name: '測試管理者用戶45',
    email: 'admin@example.com',
    password: 'hexSchool12345'
  }
  const tagsInfo = {
    name: 'testPut'
  }
  let requestRoute = '/api/v1/admin/tags'
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
    const getTags = await server
      .get('/api/v1/admin/tags')
      .query({ page: 1 })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    const tagsId = getTags.body.data[0].id
    requestRoute = `${requestRoute}/${tagsId}`
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('未帶入token，回傳HTTP Code 401', async () => {
    const result = await server
      .put(requestRoute)
      .send(tagsInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.UNAUTHORIZED)
    expect(result.body.message).toEqual('你沒有權限存取此資源')
  })

  it('不輸入name，回傳HTTP Code 400', async () => {
    const result = await server
      .put(requestRoute)
      .send({})
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的name，回傳HTTP Code 400', async () => {
    const result = await server
      .put(requestRoute)
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
      .put(requestRoute)
      .send(tagsInfo)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.message).toEqual('更新成功')
  })

  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .put(requestRoute)
      .send(tagsInfo)
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
