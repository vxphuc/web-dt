const express = require('express')
const router = express.Router()
const authContrller = require('../app/controllers/authController')
const checkAuth = require('../app/middlewares/checkAuth')
const checkRole = require('../app/middlewares/checkRole')
const multerUpload = require('../app/middlewares/multerUpload')
const rateLimit = require('../app/middlewares/rateLimit/ipRateLimit')


// sự kiện event
const eventController = require("../app/controllers/eventController")
router.post("/event", eventController.saveInformation)

//đăng nhập
router.post('/', authContrller.signin)
// tạo OTP
router.post('/create-otp',rateLimit.limitPhone, authContrller.createOTP)
// tạo mac gửi cho zalo
router.post('/mac', authContrller.createHmacSignature)
//tạo banner hiển thị trang home
router.post('/upload-banner', checkAuth, checkRole(['admin']), multerUpload.single('image') ,authContrller.uploadBaner)
router.get('/NotificationAdmin', checkRole(['admin']) ,authContrller.notification)



//đăng xuất
router.post('/logout', checkAuth, authContrller.logout)
//lấy ra tất cả user dành cho editor và admin
router.get('/user', checkAuth, checkRole('admin'), authContrller.Getuser)
//lấy ra tất cả banner để hiển thị
router.get('/banner', authContrller.GetBanner)
//đăng nhập tài khoản
router.get('/user-profile',checkAuth, authContrller.userProfile)
// xác minh giao dịch zalo-mini-app
router.post('/verify-zalo/callback', authContrller.verifySignature)


//chỉnh sửa tài khoản
router.put('/editProfile',checkAuth, authContrller.editProfile)
// lấy token từ zalo gửi về
router.post('/zalo/decode-phone', authContrller.decodePhone)
// lấy tài khoản đang nhập bằng tài khaonr admin
router.get('/user-profile-admin/:id',checkAuth, checkRole('admin'), authContrller.getUserByAdmin)

//cập nhập role cho KOC
router.patch("/dang-ky-koc/:numberPhone", authContrller.approveKOC)

//chỉnh sửa tài khoản bằng tài khoản admin
router.put('/:id/editUserByAdmin',checkAuth, checkRole('admin'), authContrller.editUserByAdmin)
//điền thông tin tài khoản còn thiếu
router.put('/:uid/fillInInformation',checkAuth, authContrller.fillInInformation)

//xóa banner
router.delete('/banner/:id/delete',checkAuth, authContrller.deleteBanner)


module.exports = router
