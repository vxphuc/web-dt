const express = require('express')
const router = express.Router()
const authContrller = require('../app/controllers/authController')
const checkAuth = require('../app/middlewares/checkAuth')
const checkRole = require('../app/middlewares/checkRole')
const multerUpload = require('../app/middlewares/multerUpload')

//đăng nhập
router.post('/', authContrller.signin)
//tạo banner hiển thị trang home
router.post('/upload-banner', multerUpload.single('image') ,authContrller.uploadBaner)
router.get('/NotificationAdmin', checkRole(['admin']) ,authContrller.notification)



//đăng xuất
router.post('/logout', authContrller.logout)
//lấy ra tất cả user dành cho editor và admin
router.get('/user', checkRole('admin'), authContrller.Getuser)
//lấy ra tất cả banner để hiển thị
router.get('/banner', authContrller.GetBanner)
//đăng nhập tài khoản
router.get('/user-profile', authContrller.userProfile)
// xác minh giao dịch zalo-mini-app
router.post('/verify-zalo/callback', authContrller.verifySignature)


//chỉnh sửa tài khoản
router.put('/editProfile', authContrller.editProfile)
// lấy token từ zalo gửi về
router.post('/zalo/decode-phone', authContrller.decodePhone)
// lấy tài khoản đang nhập bằng tài khaonr admin
router.get('/user-profile-admin/:uid', checkRole('admin'), authContrller.getUserByAdmin)

//chỉnh sửa tài khoản bằng tài khoản admin
router.put('/:uid/editUserByAdmin', checkRole('admin'), authContrller.editUserByAdmin)
//điền thông tin tài khoản còn thiếu
router.put('/:uid/fillInInformation', authContrller.fillInInformation)

//xóa banner
router.delete('/banner/:id/delete', authContrller.deleteBanner)


module.exports = router
