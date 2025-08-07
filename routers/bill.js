const express = require('express');
const router = express.Router();
const checkAuth = require('../app/middlewares/checkAuth');
const billController = require('../app/controllers/billController');
const checkRole = require('../app/middlewares/checkRole');


// xem tất cả hóa đơn
router.get('/', checkRole(['admin', 'user']), billController.getAllBill);
//lấy hóa đơn theo người dùng
router.get('/user', checkAuth, billController.getBillByUser);
//tạo mói hóa đơn
router.post( '/create', billController.createBill)
//sửa trạng thái giao dịch
router.patch('/billstatus/:id', billController.updateStatus);
router.patch('/status/:id', billController.updateBillStatus);
//Hủy đơn hàng
router.patch('/cancel/:id', checkAuth, billController.cancelOrder);
//lấy hóa đơn theo mã hóa đơn
router.get('/:id', billController.getBillByCode);

module.exports = router;