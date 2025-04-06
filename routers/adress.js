const express = require('express');
const router = express.Router();
const addressController = require('../app/controllers/adressController');

//tạo mới địa chỉ
router.post('/create', addressController.createAddress);

module.exports = router;