const path = require('path');
const fs = require('fs');
const { convert } = require('pdf2pic');
const crypto = require("crypto");

// Upload PDF và chuyển đổi thành flip book
const uploadBrochure = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Vui lòng chọn file PDF',
        success: false
      });
    }

    const pdfPath = req.file.path;
    const fileName = path.parse(req.file.filename).name;
    const brochureId = crypto.randomUUID();
    
    // Thư mục output cho flip book
    const outputDir = path.join(__dirname, '../../output/brochure', brochureId);
    
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Cấu hình chuyển đổi PDF sang PNG
    const options = {
      density: 200, // độ phân giải (DPI)
      saveFilename: 'page',
      savePath: outputDir,
      format: 'png',
      width: 1280, // chiều rộng ảnh
      height: 1920 // chiều cao ảnh
    };

    console.log(`🔄 Đang chuyển đổi PDF: ${pdfPath}`);
    
    // Chuyển đổi PDF sang ảnh
    const result = await convert({
      libPath: require('pdf2pic').libPath,
      sourcePath: pdfPath,
      ...options
    });

    console.log(`✅ Chuyển đổi thành công: ${result.length} trang`);

    // Lấy danh sách file ảnh được tạo
    const pages = fs.readdirSync(outputDir)
      .filter(file => file.endsWith('.png'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      })
      .map(file => `/output/brochure/${brochureId}/${file}`);

    // Xóa file PDF gốc sau khi chuyển đổi
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }

    res.status(200).json({
      message: 'Upload và chuyển đổi PDF thành công',
      success: true,
      data: {
        brochureId,
        fileName,
        totalPages: pages.length,
        pages,
        url: `/brochure/${brochureId}` // URL để xem flip book
      }
    });

  } catch (error) {
    console.error('❌ Lỗi chuyển đổi PDF:', error.message);
    
    // Xóa file upload nếu có lỗi
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: 'Lỗi chuyển đổi PDF',
      success: false,
      error: error.message
    });
  }
};

// Lấy thông tin flip book
const getBrochure = async (req, res) => {
  try {
    const { brochureId } = req.params;
    const brochureDir = path.join(__dirname, '../../output/brochure', brochureId);

    if (!fs.existsSync(brochureDir)) {
      return res.status(404).json({
        message: 'Không tìm thấy brochure',
        success: false
      });
    }

    const pages = fs.readdirSync(brochureDir)
      .filter(file => file.endsWith('.png'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      })
      .map(file => `/output/brochure/${brochureId}/${file}`);

    res.status(200).json({
      message: 'Lấy thông tin brochure thành công',
      success: true,
      data: {
        brochureId,
        totalPages: pages.length,
        pages
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Lỗi lấy thông tin brochure',
      success: false,
      error: error.message
    });
  }
};

// Xóa flip book
const deleteBrochure = async (req, res) => {
  try {
    const { brochureId } = req.params;
    const brochureDir = path.join(__dirname, '../../output/brochure', brochureId);

    if (!fs.existsSync(brochureDir)) {
      return res.status(404).json({
        message: 'Không tìm thấy brochure',
        success: false
      });
    }

    // Xóa folder và tất cả file bên trong
    fs.rmSync(brochureDir, { recursive: true, force: true });

    res.status(200).json({
      message: 'Xóa brochure thành công',
      success: true
    });

  } catch (error) {
    res.status(500).json({
      message: 'Lỗi xóa brochure',
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  uploadBrochure,
  getBrochure,
  deleteBrochure
};
