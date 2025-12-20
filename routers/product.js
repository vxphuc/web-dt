const express = require('express')
const router = express.Router()
const upload = require('../app/middlewares/multerUpload')
const checkAuth = require('../app/middlewares/checkAuth')


//controller
const productController = require('../app/controllers/productController')


//post
router.post('/create',upload.array('images', 10), productController.create)
router.post('/seeding-product', productController.seeding)

//patch
router.patch('/:id/destroy', productController.destroy)
router.patch('/:id/Restore', productController.Restore)

//Put

//sửa sản phẩm
router.put('/:id/fixProduct',upload.single('image'), productController.fixProduct)



//delete
router.delete('/:id/delete', productController.Delete)

//get
router.get('/search', productController.search)
router.get('/getAllProducts', productController.getAllProducts)
router.get('/ProductsNest', productController.getProductsNest)
router.get('/newProduct', productController.newProduct)
router.get('/', productController.index)
router.get('/Recycle-Bin', productController.RecycleBin)
router.get('/getProducts/:slug', productController.getProducts)
router.get('/ProductsNest/:slug', productController.getProductsNest)
router.get('/:slug', productController.show)



module.exports = router