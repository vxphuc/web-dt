const express = require("express");
const router = express.Router();
const chartController = require("../app/controllers/chartController");
const checkAuth = require("../app/middlewares/checkAuth");
const checkRole = require("../app/middlewares/checkRole");

router.get("/getYearRevenue", checkAuth, checkRole(['admin']), chartController.getYearRevenue);


module.exports = router;