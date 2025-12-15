require('dotenv').config(); // Đảm bảo có .env nếu anh dùng biến môi trường
const mongoose = require('mongoose');
const {connect} = require('../config/db'); // ⬅ dùng file connect đã viết sẵn
const User = require('../app/models/user');

(async () => {
  try {
    // Kết nối MongoDB trước
    await connect();

    // THÊM LOG cho dễ kiểm tra
    console.log('🔌 Kết nối MongoDB thành công');

    // Tạo index unique cho numberPhone
    const result = await User.collection.createIndex(
      { numberPhone: 1 },
      { unique: true }
    );

    console.log(`✅ Đã tạo index: ${result}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi tạo index:', err.message);
    process.exit(1);
  }
})();
