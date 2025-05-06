const express = require("express");
const router = express.Router();
const chatbotController = require("../app/controllers/chatbotController");
const checkAuth = require("../app/middlewares/checkAuth");
const checkRole = require("../app/middlewares/checkRole");

//giao tiếp với về doanh thu chatbot
router.post("/analyzeRevenue", chatbotController.analyzeRevenue);

module.exports = router;