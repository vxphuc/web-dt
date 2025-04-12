const express = require('express');
const router = express.Router();
const checkAuth = require('../app/middlewares/checkAuth');
const billController = require('../app/controllers/billController');

//lấy hóa đơn theo người dùng
router.get('/user', checkAuth, billController.getBillByUser);
//tạo mói hóa đơn
router.post( '/create', checkAuth, billController.createBill)

module.exports = router;