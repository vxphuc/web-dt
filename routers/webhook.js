const express = require('express');
const router = express.Router();
const webhookController = require('../app/controllers/webhookController');

router.get('/webhook', webhookController.handleWebhook);
router.post('/check', webhookController.handlecheck);

module.exports = router;