const express = require('express')

const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('users'),
  logger
})
const isAdmin = require('../middlewares/isAdmin')
const adminController = require('../controllers/admin')

router.use(auth)
router.put('/users/role', adminController.putUserRole)

router.use(isAdmin)

router.post('/category', adminController.postCategory)

router.get('/category', adminController.getCategories)

router.put('/category/:category_id', adminController.putCategory)

router.delete('/category/:category_id', adminController.deleteCategory)

router.post('/tags', adminController.postTags)

router.get('/tags', adminController.getTags)

router.put('/tags/:tags_id', adminController.putTag)

router.delete('/tags/:tags_id', adminController.deleteTag)

router.post('/products', adminController.postProducts)

router.get('/products', adminController.getProducts)

router.get('/products/:products_id', adminController.getProductDetail)

router.put('/products/:products_id', adminController.putProductDetail)

router.delete('/products/:products_id', adminController.deleteProduct)

router.post('/upload', adminController.postUploadImage)

module.exports = router
