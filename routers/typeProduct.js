const express = require('express')
const router = express.Router()
const upload = require('../app/middlewares/multerUpload')
const typeProductController = require('../app/controllers/typeProductController')

//POST
router.post('/create', upload.single('image'), typeProductController.create)

//PUT
router.put('/update/:id', upload.single('image'), typeProductController.update)

//PATCH
//xóa mềm
router.patch('/delete-sort/:id', typeProductController.deleteSort)
//khôi phục
router.patch('/restore/:id', typeProductController.restore)

//DELETE
router.delete('/delete/:id', typeProductController.deleteForever)

//GET
router.get('/', typeProductController.index)
router.get('/delete-typeProduct', typeProductController.GetdeleteTypeProduct)
router.get('/detailTypeProduct/:slug', typeProductController.detail)

module.exports = router