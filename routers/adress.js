const express = require('express');
const router = express.Router();
const addressController = require('../app/controllers/adressController');
const checkAuth = require('../app/middlewares/checkAuth');

//tạo mới địa chỉ
router.post('/create', checkAuth, addressController.createAddress);

// xem địa chỉ
router.get('/', checkAuth, addressController.getAdress);

module.exports = router;