const rateLimit = require("express-rate-limit");

//gia hạn số điện thoại request
const limitPhone = rateLimit.rateLimit({
    windowMs: 5 * 60 * 1500,
    limit: 5,
    ipv6Subnet: 64,
    message: 'vui lòng đợi 5 phút rồi thử lại...',
})

module.exports = {
    limitPhone
}