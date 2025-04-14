const express = require('express');
const router = express.Router();
const server = require('../app/controllers/serverController')
const checkAuth = require('../app/middlewares/checkAuth')

router.post('/casso', checkAuth, server.casso);

module.exports = router