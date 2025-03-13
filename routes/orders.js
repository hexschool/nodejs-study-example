const express = require('express')

const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Users')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('users'),
  logger
})

const router = express.Router()
const controller = require('../controllers/orders')

router.post('/', auth, controller.postOrder)

module.exports = router
