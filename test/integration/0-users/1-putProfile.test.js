const {
  describe, it, expect, afterEach, beforeEach, beforeAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')
const route = '/api/v1/users/profile'

describe(`PUT ${route}`, () => {
  let server
  let token
  const testUserInfo = {
    name: '測試用戶',
    email: `${new Date().getTime()}@example.com`,
    password: 'hexSchool12345'
  }
  const updateUserInfo = {
    name: 'put測試用戶',
    tel: '0912345678',
    address: '六角幸福路'
  }
  beforeAll(async () => {
    server = await TestServer.getServer()
    await server
      .post('/api/v1/users/signup')
      .send(testUserInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    const loginResult = await server
      .post('/api/v1/users/signin')
      .send({
        email: testUserInfo.email,
        password: testUserInfo.password
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
      .put(route)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.UNAUTHORIZED)
    expect(result.body.message).toEqual('你沒有權限存取此資源')
  })
  it('未帶入name，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({})
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('帶入錯誤格式的name，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        name: 123456,
        tel: updateUserInfo.tel,
        address: updateUserInfo.address
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })
  it('帶入相同的name，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        name: testUserInfo.name,
        tel: updateUserInfo.tel,
        address: updateUserInfo.address
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('使用者名稱未變更')
  })

  it('更新使用者失敗，回傳HTTP Code 400', async () => {
    const userRepo = dataSource.getRepository('users')
    jest.spyOn(userRepo, 'update').mockImplementation(() => ({
      affected: 0
    }))
    const result = await server
      .put(route)
      .send(updateUserInfo)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('更新使用者資料失敗')
  })

  it('帶入正確的token，回傳HTTP Code 200', async () => {
    const result = await server
      .put(route)
      .send(updateUserInfo)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.data.user.name).toEqual(updateUserInfo.name)
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    const userRepo = dataSource.getRepository('users')
    jest.spyOn(userRepo, 'update').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .put(route)
      .send({
        ...updateUserInfo,
        name: testUserInfo.name
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
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
