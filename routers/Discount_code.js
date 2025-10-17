const express = require("express")
const router = express.Router();
const Discount_code_controller = require('../app/controllers/Discount_codeController')

//trả về giá trị mã giảm giá
router.post("/gia-tri-cua-ma", Discount_code_controller.giaTriMaGiam)

module.exports = router