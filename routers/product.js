const express = require('express')
const router = express.Router()
const upload = require('../app/middlewares/multerUpload')

//controller
const productController = require('../app/controllers/productController')

//patch
router.patch('/:id/destroy', productController.destroy)
router.patch('/:id/Restore', productController.Restore)

//Put

//sửa sản phẩm
router.put('/:id/fixProduct',upload.single('image'), productController.fixProduct)

//post
router.post('/create',upload.single('image'), productController.create)

//delete
router.delete('/:id/delete', productController.Delete)

//get
router.get('/', productController.index)
router.get('/Recycle-Bin', productController.RecycleBin)
router.get('/:slug', productController.show)



module.exports = router