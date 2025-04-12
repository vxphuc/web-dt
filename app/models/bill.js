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
  product: [
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
    enum: ["chờ xác nhận", "đã xác nhận", "đã giao hàng"],
    default: "chờ xác nhận",
    require: true,
  },
});

module.exports = mongoose.model("Bill", billSchema);
