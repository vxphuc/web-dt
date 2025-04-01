const express = require('express');
const router = express.Router();
const reviewFormController = require('../app/controllers/reviewFormController')
const upload = require('../app/middlewares/multerUpload')

//đánh giá sản phẩm
router.post('/reviewProduct', upload.array('img', 3), reviewFormController.createReview)

//xem đánh giá sản phẩm
router.get('/:id', reviewFormController.getReviewForm);

module.exports = router