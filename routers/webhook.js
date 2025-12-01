const express = require('express');
const router = express.Router();
const webhookController = require('../app/controllers/webhookController');

//Router này sẽ là webhook nhận thông tin giao dịch từ casso gọi qua được bảo mật bằng secure_token trong header
router.post('/handler-bank-transfer', webhookController.handleWebhook);

// Router này sẽ thực hiện tính năng đồng bộ giao dịch tức thì.
// Ví dụ: Khi người dùng chuyển khoản cho bạn và họ ấn nút tôi đã thanh toán thì nên xử lí gọi qua casso đề đồng bộ giao dịch vừa chuyển khoản
router.post("/users-paid", webhookController.usersPaid)

// Route này sẽ thực hiện đăng kí webhook dựa vào API KEY và lấy thông tin về business và banks
router.post('/register-webhook', webhookController.registerWebhook)

router.post('/check', webhookController.handlecheck);

module.exports = router;