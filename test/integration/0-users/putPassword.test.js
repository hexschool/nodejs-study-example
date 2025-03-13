const {
  describe, it, expect, afterEach, beforeEach, beforeAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')
const route = '/api/v1/users/password'

describe(`PUT ${route}`, () => {
  let server
  let token
  const testUserInfo = {
    name: '測試用戶',
    email: `${new Date().getTime()}@example.com`,
    password: 'hexSchool12345'
  }
  const updateUserInfo = {
    password: testUserInfo.password,
    new_password: 'hexSchool123456',
    confirm_new_password: 'hexSchool123456'
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
  it('未帶入password，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({})
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)

    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('帶入錯誤格式的password，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        password: 123456
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)

    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('未帶入new_password，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        password: testUserInfo.password
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)

    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('帶入錯誤格式的new_password，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        password: testUserInfo.password,
        new_password: 123456
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)

    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('未帶入confirm_new_password，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        password: testUserInfo.password,
        new_password: updateUserInfo.new_password
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)

    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('帶入錯誤格式的confirm_new_password，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        password: testUserInfo.password,
        new_password: updateUserInfo.new_password,
        confirm_new_password: 123456
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)

    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入不符合規則的密碼，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        password: 'hexschool1234567',
        new_password: updateUserInfo.new_password,
        confirm_new_password: updateUserInfo.new_password
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)

    expect(result.body.message).toEqual('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長32個字')
  })

  it('輸入不符合規則的新密碼，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        password: testUserInfo.password,
        new_password: 'hexschool1234567',
        confirm_new_password: updateUserInfo.new_password
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)

    expect(result.body.message).toEqual('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長32個字')
  })

  it('輸入不符合規則的驗證新密碼，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        password: testUserInfo.password,
        new_password: updateUserInfo.new_password,
        confirm_new_password: 'hexschool1234567'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)

    expect(result.body.message).toEqual('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長32個字')
  })

  it('新密碼不能與舊密碼相同，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        password: testUserInfo.password,
        new_password: testUserInfo.password,
        confirm_new_password: updateUserInfo.new_password
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)

    expect(result.body.message).toEqual('新密碼不能與舊密碼相同')
  })

  it('新密碼與驗證新密碼不一致，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        password: testUserInfo.password,
        new_password: updateUserInfo.new_password,
        confirm_new_password: testUserInfo.password
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)

    expect(result.body.message).toEqual('新密碼與驗證新密碼不一致')
  })

  it('更新密碼失敗，回傳HTTP Code 400', async () => {
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

    expect(result.body.message).toEqual('更新密碼失敗')
  })

  it('帶入正確密碼，回傳HTTP Code 200', async () => {
    const result = await server
      .put(route)
      .send(updateUserInfo)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.data).toBe(null)
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    const userRepo = dataSource.getRepository('users')
    jest.spyOn(userRepo, 'update').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .put(route)
      .send(updateUserInfo)
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
