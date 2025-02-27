function Decimal128toString(Schema, Key) {
    Schema.set('toJSON', {
      getters: true,
      transform: (doc, ret) => {
        if (ret[Key]) {
          ret[Key] = ret[Key].toString(); // Chuyển Decimal128 thành string
        }
        delete ret.__v; // Xóa thuộc tính không cần thiết
        return ret;
      },
    });
  }
  
module.exports = Decimal128toString
  