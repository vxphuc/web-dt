const express = require('express');
const router = express.Router();
const checkAuth = require('../app/middlewares/checkAuth');
const billController = require('../app/controllers/billController');
const checkRole = require('../app/middlewares/checkRole');
const rateLimit = require('../app/middlewares/rateLimit/ipRateLimit');


// xem tất cả hóa đơn
router.get('/', checkAuth, checkRole(['admin']), billController.getAllBill);
//lấy hóa đơn theo người dùng
router.get('/user', checkAuth, billController.getBillByUser);
// lấy hóa đơn theo người dùng và trạng thái
router.get('/user/status', checkAuth, billController.getBillByUserAndStatus);
// Tính giá từ database và xác minh mã giảm giá.
router.post('/quote', rateLimit.limitOrder, billController.quoteBill);
//tạo mói hóa đơn
router.post('/create', rateLimit.limitOrder, billController.createBill)

// sự kiện yến sữa
router.post("/mua-yen-sua", billController.doiqua)


//sửa trạng thái giao dịch
router.patch('/billstatus/:id', checkAuth, checkRole(['admin', 'editor']), billController.updateStatus);
router.patch('/status/:id', checkAuth, checkRole(['admin', 'editor']), billController.updateBillStatus);
//Hủy đơn hàng
router.patch('/cancel/:id', checkAuth, billController.cancelOrder);
//lấy hóa đơn theo mã hóa đơn
router.get('/:id', checkAuth, billController.getBillByCode);

module.exports = router;
