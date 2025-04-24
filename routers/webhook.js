const express = require('express');
const router = express.Router();
const webhookController = require('../app/controllers/webhookController');

router.post('/webhook', webhookController.handleWebhook);

module.exports = router;