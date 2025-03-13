const {
  describe, it, expect, afterEach, beforeEach, beforeAll, afterAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/v1/admin/products/:products_id'

describe(`GET ${route}`, () => {
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
      .get(requestRoute)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.UNAUTHORIZED)
    expect(result.body.message).toEqual('你沒有權限存取此資源')
  })
  it('取得產品詳細資訊，回傳HTTP Code 200', async () => {
    const result = await server
      .get(requestRoute)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200)
    expect(result.body.message).toEqual('成功')
    expect(result.body.data).toHaveProperty('id')
    expect(result.body.data).toHaveProperty('category')
    expect(result.body.data).toHaveProperty('tags')
    expect(result.body.data).toHaveProperty('name')
    expect(result.body.data).toHaveProperty('description')
    expect(result.body.data).toHaveProperty('image_url')
    expect(result.body.data).toHaveProperty('origin_price')
    expect(result.body.data).toHaveProperty('price')
    expect(result.body.data).toHaveProperty('colors')
    expect(result.body.data).toHaveProperty('spec')
    expect(result.body.data).toHaveProperty('enable')
    expect(typeof result.body.data.id).toBe('string')
    expect(typeof result.body.data.category).toBe('string')
    expect(Array.isArray(result.body.data.tags)).toBe(true)
    result.body.data.tags.forEach((item) => {
      expect(typeof item.id).toBe('string')
      expect(typeof item.name).toBe('string')
    })
    expect(typeof result.body.data.name).toBe('string')
    expect(typeof result.body.data.description).toBe('string')
    expect(typeof result.body.data.image_url).toBe('string')
    expect(typeof result.body.data.origin_price).toBe('number')
    expect(typeof result.body.data.price).toBe('number')
    expect(typeof result.body.data.enable).toBe('boolean')
    expect(Array.isArray(result.body.data.colors)).toBe(true)
    result.body.data.colors.forEach((item) => {
      expect(typeof item).toBe('string')
    })
    expect(Array.isArray(result.body.data.spec)).toBe(true)
    result.body.data.spec.forEach((item) => {
      expect(typeof item).toBe('string')
    })
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .get(requestRoute)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(500)
    expect(result.body.message).toEqual('伺服器錯誤')
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(async () => {
    await TestServer.close()
  })
})
