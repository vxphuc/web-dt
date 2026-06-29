const express = require('express');
const multer = require('multer');
const router = express.Router();
const uploadPDF = require('../app/middlewares/uploadPDF');
const { uploadBrochure, 
        getBrochure,
        deleteBrochure } = require('../app/controllers/brochureController');

// POST - Upload PDF và chuyển đổi thành flip book
const handlePDFUpload = (req, res, next) => {
  uploadPDF.single('file')(req, res, (error) => {
    if (!error) return next();

    const isTooLarge = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE';
    return res.status(isTooLarge ? 413 : 400).json({
      success: false,
      message: isTooLarge
        ? 'File PDF không được vượt quá 100MB'
        : error.message || 'Không thể upload file PDF'
    });
  });
};

router.post('/upload', handlePDFUpload, uploadBrochure);

// GET - Lấy thông tin brochure theo ID
router.get('/:brochureId', getBrochure);

// DELETE - Xóa brochure
router.delete('/:brochureId', deleteBrochure);

module.exports = router;
