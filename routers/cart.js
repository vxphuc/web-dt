const express = require('express')
const router = express.Router()
const cartsController = require('../app/controllers/cartsController')
const checkAuth = require('../app/middlewares/checkAuth')

//lấy địa chỉ
router.get('/getAdd', checkAuth,  cartsController.getAdd)
//cập nhập địa chỉ giỏ hàng
router.patch('/updateAddress', checkAuth, cartsController.updateAddress)
//tăng sản phẩm trong giỏ hàng
router.patch('/updateincrease/:id', checkAuth, cartsController.updateincrease)
//thêm sản phẩm vào giỏ hàng
router.post('/create', checkAuth, cartsController.create)
//xem giỏ hàng
router.get('/', checkAuth, cartsController.index)
//xóa sản phẩm trong giỏ hàng khi đã hoàn thành thanh toán
router.delete('/deleteCart', checkAuth, cartsController.deleteCart)
//xóa sản phẩm trong giỏ hàng
router.delete('/delete/:id', checkAuth, cartsController.Delete)
//tăng sản phẩm trong giỏ hàng
router.patch('/updateincrease/:id', checkAuth, cartsController.updateincrease)
//giảm sản phẩm trong giỏ hàng
router.patch('/updateDecrease/:id', checkAuth, cartsController.updateDecrease)

module.exports = router