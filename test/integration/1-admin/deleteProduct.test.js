const {
  describe, it, expect, afterEach, beforeEach, beforeAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/v1/admin/products/:products_id'

describe(`DELETE ${route}`, () => {
  let server
  let requestRoute = '/api/v1/admin/products'
  let targetProduct
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
    const products = await server
      .get('/api/v1/admin/products')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    targetProduct = products.body.data.products[0]
    requestRoute = `${requestRoute}/${targetProduct.id}`
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('未帶入token，回傳HTTP Code 401', async () => {
    const result = await server
      .del(requestRoute)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.UNAUTHORIZED)
    expect(result.body.message).toEqual('你沒有權限存取此資源')
  })

  it('帶入正確的資訊，回傳HTTP Code 200', async () => {
    const result = await server
      .del(requestRoute)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.message).toEqual('刪除成功')
  })

  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .del(requestRoute)
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
