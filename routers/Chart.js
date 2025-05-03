const express = require("express");
const router = express.Router();
const chartController = require("../app/controllers/chartController");

router.get("/BillMonthlyRevenue", chartController.getMonthlyRevenue);


module.exports = router;