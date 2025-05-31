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

//đăng xuất
router.post('/logout', authContrller.logout)
//lấy ra tất cả user dành cho editor và admin
router.get('/user',checkAuth, checkRole('admin'), authContrller.Getuser)
//lấy ra tất cả banner để hiển thị
router.get('/banner', authContrller.GetBanner)
//đăng nhập tài khoản
router.get('/user-profile', checkAuth ,authContrller.userProfile)


//chỉnh sửa tài khoản
router.put('/editProfile', checkAuth, authContrller.editProfile)

//chỉnh sửa tài khoản bằng tài khoản admin
router.put('/:uid/editUserByAdmin', checkAuth, checkRole('admin'), authContrller.editUserByAdmin)
//điền thông tin tài khoản còn thiếu
router.put('/:uid/fillInInformation', checkAuth, authContrller.fillInInformation)

//xóa banner
router.delete('/banner/:id/delete', authContrller.deleteBanner)


module.exports = router
