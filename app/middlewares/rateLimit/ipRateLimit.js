const rateLimit = require("express-rate-limit");

//gia hạn số điện thoại request
const limitPhone = rateLimit.rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    ipv6Subnet: 64,
    message: 'vui lòng đợi 5 phút rồi thử lại...',
})

module.exports = {
    limitPhone
}