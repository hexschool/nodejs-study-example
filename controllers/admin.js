const formidable = require('formidable')
const firebaseAdmin = require('firebase-admin')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const config = require('../config/index')
const { IsNull } = require('typeorm')

const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('AdminController')

const numberReg = /^[0-9]+$/

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(config.get('secret.firebase.serviceAccount')),
  storageBucket: config.get('secret.firebase.storageBucket')
})
const bucket = firebaseAdmin.storage().bucket()
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_FILE_TYPES = {
  'image/jpeg': true,
  'image/png': true
}

dayjs.extend(utc)

function isUndefined (value) {
  return value === undefined
}

function isNotValidSting (value) {
  return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

function isNotValidArrayString (value, elementMinLength, elementMaxLength) {
  if (isUndefined(value) || !Array.isArray(value) ||
  value.length === 0) {
    return true
  }
  for (let index = 0; index < value.length; index++) {
    const element = value[index]
    if (isUndefined(element) || isNotValidSting(element) || element.length > elementMaxLength || element.length < elementMinLength) {
      return true
    }
  }
  return false
}

function isNotValidInteger (value) {
  return typeof value !== 'number' || value < 0 || value % 1 !== 0
}

class AdminController {
  static async putUserRole (req, res, next) {
    try {
      const { id } = req.user
      const {
        role
      } = req.body
      const roleMap = {
        admin: 'ADMIN',
        user: 'USER'
      }
      if (isUndefined(role) || isNotValidSting(role) || !roleMap[role]) {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
        return
      }
      const result = await dataSource.getRepository('users').update({ id }, { role: roleMap[role] })
      if (result.affected === 0) {
        logger.warn('轉換失敗')
        res.status(400).json({
          status: 'failed',
          message: '轉換失敗'
        })
        return
      }
      res.status(200).json({
        message: '轉換成功',
        role: roleMap[role]
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async postCategory (req, res, next) {
    try {
      const { name } = req.body
      if (isUndefined(name) || isNotValidSting(name) || name.trim().length < 2 || name.trim().length > 10) {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          message: '欄位未填寫正確'
        })
        return
      }
      const categoryRepository = dataSource.getRepository('product_categories')
      const result = await categoryRepository.save(categoryRepository.create({ name }))
      if (result.affected === 0) {
        logger.warn('新增失敗')
        res.status(400).json({
          message: '新增失敗'
        })
        return
      }
      res.status(200).json({
        message: '新增成功'
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async getCategories (req, res, next) {
    try {
      const { page = 1 } = req.query
      if (!numberReg.test(page) || page < 1 || page % 1 !== 0) {
        res.status(400).json({
          message: '頁數輸入錯誤'
        })
        return
      }
      const pageToInt = parseInt(page, 10)
      const perPage = 10
      const skip = (pageToInt - 1) * perPage
      const total = await dataSource.getRepository('product_categories').count({
        where: {
          deleted_at: IsNull()
        }
      })
      const result = await dataSource.getRepository('product_categories').find({
        select: ['id', 'name'],
        where: {
          deleted_at: IsNull()
        },
        order: {
          created_at: 'DESC'
        },
        take: 10,
        skip
      })
      res.status(200).json({
        message: '成功',
        data: result,
        pagination: {
          current_page: pageToInt,
          total_page: Math.ceil(total / perPage)
        }
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async putCategory (req, res, next) {
    try {
      const { name } = req.body
      const { category_id: categoryId } = req.params
      if (isUndefined(name) || isNotValidSting(name) || name.trim().length < 2 || name.trim().length > 10) {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          message: '欄位未填寫正確'
        })
        return
      }
      const categoryRepository = dataSource.getRepository('product_categories')
      const result = await categoryRepository.update({ id: categoryId }, { name })
      if (result.affected === 0) {
        logger.warn('更新失敗')
        res.status(400).json({
          message: '更新失敗'
        })
        return
      }
      res.status(200).json({
        message: '更新成功'
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async deleteCategory (req, res, next) {
    try {
      const { category_id: categoryId } = req.params
      const categoryRepository = dataSource.getRepository('product_categories')
      const result = await categoryRepository.update({ id: categoryId }, { deleted_at: dayjs().utc().format('YYYY-MM-DD HH:mm:ss') })
      if (result.affected === 0) {
        logger.warn('刪除失敗')
        res.status(400).json({
          message: '刪除失敗'
        })
        return
      }
      res.status(200).json({
        message: '刪除成功'
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async postTags (req, res, next) {
    try {
      const { name } = req.body
      if (isUndefined(name) || isNotValidSting(name) || name.trim().length < 2 || name.trim().length > 10) {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          message: '欄位未填寫正確'
        })
        return
      }
      const categoryRepository = dataSource.getRepository('product_tags')
      const result = await categoryRepository.save(categoryRepository.create({ name }))
      if (result.affected === 0) {
        logger.warn('新增失敗')
        res.status(400).json({
          message: '新增失敗'
        })
        return
      }
      res.status(200).json({
        message: '新增成功'
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async getTags (req, res, next) {
    try {
      const { page = 1 } = req.query
      if (!numberReg.test(page) || page < 1 || page % 1 !== 0) {
        res.status(400).json({
          message: '頁數輸入錯誤'
        })
        return
      }
      const pageToInt = parseInt(page, 10)
      const perPage = 10
      const skip = (pageToInt - 1) * perPage
      const total = await dataSource.getRepository('product_tags').count({
        where: {
          deleted_at: IsNull()
        }
      })
      const result = await dataSource.getRepository('product_tags').find({
        select: ['id', 'name'],
        where: {
          deleted_at: IsNull()
        },
        order: {
          created_at: 'DESC'
        },
        take: 10,
        skip
      })
      res.status(200).json({
        message: '成功',
        data: result,
        pagination: {
          current_page: pageToInt,
          total_page: Math.ceil(total / perPage)
        }
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async putTag (req, res, next) {
    try {
      const { name } = req.body
      const { tags_id: tagsId } = req.params
      if (isUndefined(name) || isNotValidSting(name) || name.trim().length < 2 || name.trim().length > 10) {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          message: '欄位未填寫正確'
        })
        return
      }
      const tagRepository = dataSource.getRepository('product_tags')
      const result = await tagRepository.update({ id: tagsId }, { name })
      if (result.affected === 0) {
        logger.warn('更新失敗')
        res.status(400).json({
          message: '更新失敗'
        })
        return
      }
      res.status(200).json({
        message: '更新成功'
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async deleteTag (req, res, next) {
    try {
      const { tags_id: tagsId } = req.params
      const tagRepository = dataSource.getRepository('product_tags')
      const result = await tagRepository.update({ id: tagsId }, { deleted_at: dayjs().utc().format('YYYY-MM-DD HH:mm:ss') })
      if (result.affected === 0) {
        logger.warn('刪除失敗')
        res.status(400).json({
          message: '刪除失敗'
        })
        return
      }
      res.status(200).json({
        message: '刪除成功'
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async postProducts (req, res, next) {
    try {
      const {
        category_id: categoryId, tags_id: tagsId,
        name, price, description, image_url: imageUrl, origin_price: originPrice, colors, spec, enable
      } = req.body
      if (isUndefined(categoryId) || isNotValidSting(categoryId) ||
      isUndefined(tagsId) || !Array.isArray(tagsId) ||
      tagsId.length === 0 || tagsId.every((item) => !(isUndefined || isNotValidSting(item))) ||
      isUndefined(name) || isNotValidSting(name) || name.length > 50 || name.length < 3 ||
      isUndefined(price) || isNotValidInteger(price) ||
      isUndefined(description) || isNotValidSting(description) || description.length > 200 || description.length < 3 ||
      isUndefined(imageUrl) || isNotValidSting(imageUrl) || !imageUrl.startsWith('https://') ||
      isUndefined(originPrice) || isNotValidInteger(originPrice) ||
      isNotValidArrayString(colors, 2, 10) ||
      isNotValidArrayString(spec, 2, 10) ||
      typeof enable !== 'boolean') {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          message: '欄位未填寫正確'
        })
        return
      }
      const productRepository = dataSource.getRepository('products')
      const newProduct = await productRepository.save(productRepository.create({
        product_categories_id: categoryId,
        name,
        price,
        description,
        image_url: imageUrl,
        origin_price: originPrice,
        colors: JSON.stringify(colors),
        spec: JSON.stringify(spec),
        enable
      }))
      logger.debug(`newProduct : ${JSON.stringify(newProduct, null, 1)}`)
      if (newProduct.affected === 0) {
        logger.warn('新增失敗')
        res.status(400).json({
          message: '新增失敗'
        })
        return
      }
      const productsLinkTagsRepository = dataSource.getRepository('product_link_tags')
      const linkInfo = tagsId.map((tagId) => ({
        products_id: newProduct.id,
        product_tags_id: tagId
      }))
      logger.debug(`linkInfo : ${JSON.stringify(linkInfo, null, 1)}`)
      const linkResult = await productsLinkTagsRepository.upsert(linkInfo, {
        conflictPaths: ['products_id', 'product_tags_id']
      })
      if (linkResult.affected !== linkResult.length) {
        logger.warn('新增失敗')
        await productsLinkTagsRepository.delete({ products_id: newProduct.id })
        await productRepository.delete({ id: newProduct.id })
        res.status(400).json({
          message: '新增失敗'
        })
        return
      }
      res.status(200).json({
        message: '新增成功'
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async getProducts (req, res, next) {
    try {
      const { page = 1 } = req.query
      if (!numberReg.test(page) || page < 1 || page % 1 !== 0) {
        res.status(400).json({
          message: '頁數輸入錯誤'
        })
        return
      }
      const pageToInt = parseInt(page, 10)
      const perPage = 10
      const skip = (pageToInt - 1) * perPage
      const products = await dataSource.getRepository('products').find({
        select: ['id', 'name', 'description', 'image_url', 'origin_price', 'price', 'enable'],
        where: {
          deleted_at: IsNull()
        },
        order: {
          created_at: 'DESC'
        },
        take: perPage,
        skip
      })
      const total = await dataSource.getRepository('products').count()
      res.status(200).json({
        message: '成功',
        data: {
          pagination: {
            current_page: pageToInt,
            total_page: Math.ceil(total / perPage)
          },
          products
        }
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async postUploadImage (req, res, next) {
    try {
      const form = formidable.formidable({
        multiple: false,
        maxFileSize: MAX_FILE_SIZE,
        filter: ({ mimetype }) => {
          // if (!ALLOWED_FILE_TYPES[mimetype]) {
          //   const error = new Error('不支援的檔案格式')
          //   error.statusCode = 400
          //   throw error
          // }
          return !!ALLOWED_FILE_TYPES[mimetype]
        }
      })
      const [fields, files] = await form.parse(req)
      logger.info('files')
      logger.info(files)
      logger.info('fields')
      logger.info(fields)
      const filePath = files.file[0].filepath
      const remoteFilePath = `images/${new Date().toISOString()}-${files.file[0].originalFilename}`
      await bucket.upload(filePath, { destination: remoteFilePath })
      const options = {
        action: 'read',
        expires: Date.now() + 24 * 60 * 60 * 1000
      }
      const [imageUrl] = await bucket.file(remoteFilePath).getSignedUrl(options)
      logger.info(imageUrl)
      res.status(200).json({
        data: {
          image_url: imageUrl
        }
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async getProductDetail (req, res, next) {
    try {
      const { products_id: productId } = req.params
      if (isUndefined(productId) || isNotValidSting(productId)) {
        res.status(400).json({
          message: '欄位未填寫正確'
        })
        return
      }
      const productDetail = await dataSource.getRepository('products').findOne({
        select: {
          id: true,
          name: true,
          description: true,
          image_url: true,
          origin_price: true,
          price: true,
          enable: true,
          colors: true,
          spec: true,
          product_categories: {
            name: true
          }
        },
        where: { id: productId },
        relations: {
          product_categories: true
        }
      })
      const productLinkTag = await dataSource.getRepository('product_link_tags').find({
        select: {
          product_tags: {
            id: true,
            name: true
          }
        },
        where: { products_id: productId },
        relations: {
          product_tags: true
        }
      })
      logger.info(`productDetail: ${JSON.stringify(productDetail, null, 1)}`)
      logger.info(`productLinkTag: ${JSON.stringify(productLinkTag, null, 1)}`)
      res.status(200).json({
        message: '成功',
        data: {
          id: productDetail.id,
          name: productDetail.name,
          description: productDetail.description,
          image_url: productDetail.image_url,
          origin_price: productDetail.origin_price,
          price: productDetail.price,
          enable: productDetail.enable,
          colors: JSON.parse(productDetail.colors),
          spec: JSON.parse(productDetail.spec),
          category: productDetail.product_categories.name,
          tags: productLinkTag.map(({ product_tags: productTags }) => productTags)
        }
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async putProductDetail (req, res, next) {
    try {
      const { products_id: productId } = req.params
      if (isUndefined(productId) || isNotValidSting(productId)) {
        res.status(400).json({
          message: '欄位未填寫正確'
        })
        return
      }
      const {
        category_id: categoryId, tags_id: tagsId,
        name, price, description, image_url: imageUrl, origin_price: originPrice, colors, spec, enable
      } = req.body
      if (isUndefined(categoryId) || isNotValidSting(categoryId) ||
      isUndefined(tagsId) || !Array.isArray(tagsId) ||
      tagsId.length === 0 || tagsId.every((item) => !(isUndefined || isNotValidSting(item))) ||
      isUndefined(name) || isNotValidSting(name) || name.length > 50 || name.length < 3 ||
      isUndefined(price) || isNotValidInteger(price) ||
      isUndefined(description) || isNotValidSting(description) || description.length > 200 || description.length < 3 ||
      isUndefined(imageUrl) || isNotValidSting(imageUrl) || !imageUrl.startsWith('https://') ||
      isUndefined(originPrice) || isNotValidInteger(originPrice) ||
      isNotValidArrayString(colors, 2, 10) ||
      isNotValidArrayString(spec, 2, 10) ||
      typeof enable !== 'boolean') {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          message: '欄位未填寫正確'
        })
        return
      }
      const productRepository = dataSource.getRepository('products')
      const updateProduct = await productRepository.update({ id: productId }, {
        product_categories_id: categoryId,
        name,
        price,
        description,
        image_url: imageUrl,
        origin_price: originPrice,
        colors: JSON.stringify(colors),
        spec: JSON.stringify(spec),
        enable
      })
      logger.debug(`updateProduct : ${JSON.stringify(updateProduct, null, 1)}`)
      if (updateProduct.affected === 0) {
        logger.warn('更新失敗')
        res.status(400).json({
          message: '更新失敗'
        })
        return
      }
      const productsLinkTagsRepository = dataSource.getRepository('product_link_tags')
      const linkInfo = tagsId.map((tagId) => ({
        products_id: productId,
        product_tags_id: tagId
      }))
      await productsLinkTagsRepository.delete({ products_id: productId })
      await productsLinkTagsRepository.upsert(linkInfo, {
        conflictPaths: ['products_id', 'product_tags_id']
      })
      logger.debug(`linkInfo : ${JSON.stringify(linkInfo, null, 1)}`)
      res.status(200).json({
        message: '更新成功'
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  static async deleteProduct (req, res, next) {
    try {
      const { products_id: productId } = req.params
      if (isUndefined(productId) || isNotValidSting(productId)) {
        res.status(400).json({
          message: '欄位未填寫正確'
        })
        return
      }
      const result = await dataSource.getRepository('products').update({ id: productId }, { deleted_at: dayjs().utc().format('YYYY-MM-DD HH:mm:ss') })
      if (result.affected === 0) {
        logger.warn('刪除失敗')
        res.status(400).json({
          message: '刪除失敗'
        })
        return
      }
      res.status(200).json({
        message: '刪除成功'
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }
}
module.exports = AdminController
