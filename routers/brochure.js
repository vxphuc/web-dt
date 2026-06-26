const express = require('express');
const router = express.Router();
const uploadPDF = require('../app/middlewares/uploadPDF');
const { uploadBrochure, 
        getBrochure,
        deleteBrochure } = require('../app/controllers/brochureController');

// POST - Upload PDF và chuyển đổi thành flip book
router.post('/upload', uploadPDF.single('file'), uploadBrochure);

// GET - Lấy thông tin brochure theo ID
router.get('/:brochureId', getBrochure);

// DELETE - Xóa brochure
router.delete('/:brochureId', deleteBrochure);

module.exports = router;
