const express = require("express");
const router = express.Router();
const chartController = require("../app/controllers/chartController");
const checkAuth = require("../app/middlewares/checkAuth");
const checkRole = require("../app/middlewares/checkRole");

// lấy ra số năm doanh thu và lấy số lượng đơn hiện tại
router.get("/getYearRevenue", checkAuth, checkRole(['admin']), chartController.getYearRevenue);
// lấy top 10 số lượng và doanh thu sản phẩm bán chạy nhất
router.get("/getTop10Product",checkAuth, checkRole(['admin']), chartController.getTop10Product);
// lấy ra doanh thu theo tuần của năm hiện tại
router.get("/getWeekRevenue", chartController.getWeekRevenue);


module.exports = router;