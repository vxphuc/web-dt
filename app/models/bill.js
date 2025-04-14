const mongoose = require("mongoose");
const { Schema } = mongoose;

const billSchema = new Schema({
  province: {
    type: String,
  },
  District: {
    type: String,
  },
  ward: {
    type: String,
  },
  road: {
    type: String,
  },
  UserUID: {
    type: String,
  },
  Intomoney: {
    type: String,
  },
  products: [
    {
      name: String,
      price: mongoose.Schema.Types.Decimal128,
      quantity: Number,
      img: String,
    },
  ],
  createDate: {
    type: Date,
    default: Date.now,
  },
  PaymentForm: {
    type: String,
  },
  OrderStatus: {
    type: String,
    enum: ["chờ xác nhận", "đã xác nhận", "đã giao hàng", "hủy đơn hàng"],
    default: "chờ xác nhận",
    require: true,
  },
  statusPay:{
    type:String,
    default: "chưa thanh toán",
  }
});

module.exports = mongoose.model("Bill", billSchema);
