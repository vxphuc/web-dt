const express = require('express');
const router = express.Router();
const checkAuth = require('../app/middlewares/checkAuth');
const billController = require('../app/controllers/billController');
const checkRole = require('../app/middlewares/checkRole');

// xem tất cả hóa đơn
router.get('/', checkAuth, checkRole(['admin', 'user']), billController.getAllBill);
//lấy hóa đơn theo người dùng
router.get('/user', checkAuth, billController.getBillByUser);
//tạo mói hóa đơn
router.post( '/create', checkAuth, billController.createBill)
//sử trạng thái giao dịch
router.patch('/billstatus/:id', billController.updateStatus);
router.patch('/status/:id', checkAuth, billController.updateBillStatus);
//lấy hóa đơn theo mã hóa đơn
router.get('/:id', checkAuth, billController.getBillByCode);

module.exports = router;