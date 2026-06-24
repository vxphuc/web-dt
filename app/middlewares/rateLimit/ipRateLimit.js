const rateLimit = require("express-rate-limit");

//gia hạn số điện thoại request
const limitPhone = rateLimit.rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    ipv6Subnet: 64,
    message: 'vui lòng đợi 10 phút rồi thử lại...',
})

const limitOrder = rateLimit.rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 30,
    ipv6Subnet: 64,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Quá nhiều yêu cầu đặt hàng. Vui lòng thử lại sau.' },
})


module.exports = {
    limitPhone,
    limitOrder
}
