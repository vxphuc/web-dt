const path = require('path');
const fs = require('fs');
const { fromPath } = require('pdf2pic');
const crypto = require("crypto");

const outputRoot = path.resolve(__dirname, '../../output/brochure');
const brochureIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getBrochureDirectory = (brochureId) => {
  if (!brochureIdPattern.test(brochureId)) return null;
  return path.join(outputRoot, brochureId);
};

const listBrochurePages = (brochureId, brochureDir) => fs.readdirSync(brochureDir)
  .filter(file => /^page\.\d+\.png$/i.test(file))
  .sort((first, second) => {
    const firstPage = Number(first.match(/\d+/)?.[0] || 0);
    const secondPage = Number(second.match(/\d+/)?.[0] || 0);
    return firstPage - secondPage;
  })
  .map(file => `/output/brochure/${brochureId}/${file}`);

const ensureRealPDF = async (pdfPath) => {
  const fileHandle = await fs.promises.open(pdfPath, 'r');
  try {
    const header = Buffer.alloc(5);
    const { bytesRead } = await fileHandle.read(header, 0, header.length, 0);
    if (bytesRead !== 5 || header.toString('ascii') !== '%PDF-') {
      const error = new Error('Nội dung file không phải PDF hợp lệ');
      error.status = 400;
      throw error;
    }
  } finally {
    await fileHandle.close();
  }
};

// Upload PDF và chuyển đổi thành flip book
const uploadBrochure = async (req, res) => {
  let brochureId;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Vui lòng chọn file PDF',
        success: false
      });
    }

    const pdfPath = req.file.path;
    const fileName = path.parse(req.file.originalname).name;
    brochureId = crypto.randomUUID();
    await ensureRealPDF(pdfPath);
    
    // Thư mục output cho flip book
    const outputDir = getBrochureDirectory(brochureId);
    
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
      height: 1920, // chiều cao ảnh
      preserveAspectRatio: true
    };

    console.log(`🔄 Đang chuyển đổi PDF: ${pdfPath}`);
    
    // Chuyển đổi PDF sang ảnh
    const converter = fromPath(pdfPath, options);
    const result = await converter.bulk(-1, { responseType: 'image' });

    if (!Array.isArray(result) || result.length === 0) {
      throw new Error('PDF không có trang nào hoặc không thể đọc nội dung PDF');
    }

    console.log(`✅ Chuyển đổi thành công: ${result.length} trang`);

    // Lấy danh sách file ảnh được tạo
    const pages = listBrochurePages(brochureId, outputDir);

    // Xóa file PDF gốc sau khi chuyển đổi
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }
    console.log("📤 Chuẩn bị trả response");
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
    console.log("✅ Đã gọi res.json()");
  } catch (error) {
    console.error('❌ Lỗi chuyển đổi PDF:', error);
    
    // Xóa file upload nếu có lỗi
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (brochureId) {
      const failedOutputDir = getBrochureDirectory(brochureId);
      if (failedOutputDir && fs.existsSync(failedOutputDir)) {
        fs.rmSync(failedOutputDir, { recursive: true, force: true });
      }
    }

    res.status(error.status || 500).json({
      message: error.status === 400 ? error.message : 'Lỗi chuyển đổi PDF',
      success: false,
      error: error.message
    });
  }
};

// Lấy thông tin flip book
const getBrochure = async (req, res) => {
  try {
    const { brochureId } = req.params;
    const brochureDir = getBrochureDirectory(brochureId);

    if (!brochureDir || !fs.existsSync(brochureDir)) {
      return res.status(404).json({
        message: 'Không tìm thấy brochure',
        success: false
      });
    }

    const pages = listBrochurePages(brochureId, brochureDir);

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
    const brochureDir = getBrochureDirectory(brochureId);

    if (!brochureDir || !fs.existsSync(brochureDir)) {
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
