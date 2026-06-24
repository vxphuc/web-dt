const mongoose = require("mongoose");
const { Schema } = mongoose;

const billSchema = new Schema({
  province: {
    type: String,
  },
  madonhang:{
    type: String
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
  UserName: {
    type: String,
  },
  Intomoney: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    validate: {
      validator: (value) => Number(value?.toString()) >= 0,
      message: "Tổng tiền không được âm",
    },
  },
  products: [
    {
      name: String,
      price: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        validate: {
          validator: (value) => Number(value?.toString()) >= 0,
          message: "Giá sản phẩm không được âm",
        },
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        validate: {
          validator: Number.isInteger,
          message: "Số lượng sản phẩm phải là số nguyên",
        },
      },
      img: String,
      productID: { type: String, required: true },
    },
  ],
  createDate: {
    type: Date,
    default: Date.now,
  },
  PaymentForm: {
    type: String,
    default: "Thanh toán bằng tiền mặt",
  },
  OrderStatus: {
    type: String,
    enum: [
      "chờ xác nhận",
      "đã xác nhận",
      "đã giao hàng",
      "đang giao hàng",
      "hủy đơn hàng",
    ],
    default: "chờ xác nhận",
    required: true,
  },
  statusPay: {
    type: String,
    default: "chưa thanh toán",
  },
  phoneNumber: {
    type: String,
  },
  app: {
    type: String,
    default: "web"
  },
  alternateReceiverPhone: {
    type: String,
    default: "",
  },
  alternateReceiverName: {
    type: String,
    default: "",
  },
  magiamgia: {
    type: String
  }
});

module.exports = mongoose.model("Bill", billSchema);
