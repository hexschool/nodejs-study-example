const {
  describe, it, expect, afterEach, beforeEach, beforeAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/v1/admin/products'

describe(`POST ${route}`, () => {
  let server
  const testAdminUserInfo = {
    name: '測試管理者用戶45',
    email: 'admin@example.com',
    password: 'hexSchool12345'
  }
  const productsInfo = {
    category_id: null,
    tags_id: null,
    name: 'testProduct',
    price: 100,
    description: 'testProductDescription',
    image_url: 'https://image.test.io',
    origin_price: 500,
    colors: ['c1', 'c2'],
    spec: ['s1', 's2'],
    enable: true
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
    const getCategories = await server
      .get('/api/v1/admin/category')
      .query({ page: 1 })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    const categoryId = getCategories.body.data[0].id
    const getTags = await server
      .get('/api/v1/admin/tags')
      .query({ page: 1 })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    const tagsId = getTags.body.data[0].id
    productsInfo.category_id = categoryId
    productsInfo.tags_id = [tagsId]
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

  it('不輸入category_id，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({})
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的tags_id，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: 1234
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('不輸入tags_id，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的tags_id，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: 1234
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的tags_id，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: []
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的tags_id，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: [1234]
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
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

  it('輸入錯誤的tags_id，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: [1234]
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('不輸入name，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id
      })
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
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: 1234
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('不輸入price，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的price，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: 'persona'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('不輸入description，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的description，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: 1234
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('不輸入image_url，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的image_url，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description,
        image_url: 'wrong guy'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('不輸入origin_price，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description,
        image_url: productsInfo.image_url
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的origin_price，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description,
        image_url: productsInfo.image_url,
        origin_price: 'test'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('不輸入colors，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description,
        image_url: productsInfo.image_url,
        origin_price: productsInfo.origin_price
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的colors，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description,
        image_url: productsInfo.image_url,
        origin_price: productsInfo.origin_price,
        colors: 'test'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的colors，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description,
        image_url: productsInfo.image_url,
        origin_price: productsInfo.origin_price,
        colors: []
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的colors，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description,
        image_url: productsInfo.image_url,
        origin_price: productsInfo.origin_price,
        colors: [1234]
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的colors，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description,
        image_url: productsInfo.image_url,
        origin_price: productsInfo.origin_price,
        colors: ['t']
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('不輸入spec，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description,
        image_url: productsInfo.image_url,
        origin_price: productsInfo.origin_price,
        colors: productsInfo.colors
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的spec，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description,
        image_url: productsInfo.image_url,
        origin_price: productsInfo.origin_price,
        colors: productsInfo.colors,
        spec: 'test'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的spec，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description,
        image_url: productsInfo.image_url,
        origin_price: productsInfo.origin_price,
        colors: productsInfo.colors,
        spec: []
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的spec，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description,
        image_url: productsInfo.image_url,
        origin_price: productsInfo.origin_price,
        colors: productsInfo.colors,
        spec: [1234]
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的spec，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description,
        image_url: productsInfo.image_url,
        origin_price: productsInfo.origin_price,
        colors: productsInfo.colors,
        spec: ['s']
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('不輸入enable，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description,
        image_url: productsInfo.image_url,
        origin_price: productsInfo.origin_price,
        colors: productsInfo.colors,
        spec: productsInfo.spec
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的enable，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        category_id: productsInfo.category_id,
        tags_id: productsInfo.tags_id,
        name: productsInfo.name,
        price: productsInfo.price,
        description: productsInfo.description,
        image_url: productsInfo.image_url,
        origin_price: productsInfo.origin_price,
        colors: productsInfo.colors,
        spec: productsInfo.spec,
        enable: 666
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
      .send(productsInfo)
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
        ...productsInfo,
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
      .send(productsInfo)
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
