const express = require('express')
const router = express.Router()
const cartsController = require('../app/controllers/cartsController')
const checkAuth = require('../app/middlewares/checkAuth')

//thêm sản phẩm vào giỏ hàng
router.post('/create', checkAuth, cartsController.create)
//xem giỏ hàng
router.get('/', cartsController.index)

module.exports = router