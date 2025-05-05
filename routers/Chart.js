const express = require("express");
const router = express.Router();
const chartController = require("../app/controllers/chartController");

router.get("/getYearRevenue", chartController.getYearRevenue);


module.exports = router;