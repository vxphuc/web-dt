const express = require('express');
const router = express.Router();
const addressController = require('../app/controllers/adressController');
const checkAuth = require('../app/middlewares/checkAuth');

//tạo mới địa chỉ
router.post('/create', checkAuth, addressController.createAddress);

// xem địa chỉ
router.get('/', checkAuth, addressController.getAdress);

//xóa địa chỉ
router.delete('/delete/:roadId/:wardId/:districtId/:provinceId', checkAuth, addressController.deleteAddress);

module.exports = router;