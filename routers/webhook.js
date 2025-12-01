const express = require('express');
const router = express.Router();
const webhookController = require('../app/controllers/webhookController');

router.post('/webhook', webhookController.handleWebhook);
router.post('/check', webhookController.handlecheck);

module.exports = router;