const express = require('express')
const router = express.Router()
const upload = require('../app/middlewares/multerUpload')

//controller
const productController = require('../app/controllers/productController')


//post
router.post('/create',upload.array('images', 10), productController.create)

//patch
router.patch('/:id/destroy', productController.destroy)
router.patch('/:id/Restore', productController.Restore)

//Put

//sửa sản phẩm
router.put('/:id/fixProduct',upload.single('image'), productController.fixProduct)



//delete
router.delete('/:id/delete', productController.Delete)

//get
router.get('/getAllProducts', productController.getAllProducts)
router.get('/ProductsNest', productController.getProductsNest)
router.get('/newProduct', productController.newProduct)
router.get('/', productController.index)
router.get('/Recycle-Bin', productController.RecycleBin)
router.get('/getProducts/:slug', productController.getProducts)
router.get('/ProductsNest/:slug', productController.getProductsNest)
router.get('/:slug', productController.show)



module.exports = router