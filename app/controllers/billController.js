const billModel = require("../models/bill");
const userModel = require("../models/user");
const Product = require("../models/product");
const user = require("../models/user");
const { default: axios } = require("axios");

//tạo mới hóa đơn
async function createBill(req, res) {
  try {
    const productsInOrder = req.body.products;

    if (!productsInOrder || !Array.isArray(productsInOrder)) {
      return res
        .status(400)
        .json({ message: "Dữ liệu sản phẩm không hợp lệ." });
    }

    // Gom các sản phẩm không đủ tồn kho
    let notEnoughProducts = [];
    for (const item of productsInOrder) {
      const product = await Product.getById(item.productID);
      if (!product) {
        notEnoughProducts.push({
          productID: item.productID,
          name: item.name,
          reason: "Sản phẩm không tồn tại",
        });
        continue;
      }
      if (product.quantity < item.quantity) {
        notEnoughProducts.push({
          productID: item.productID,
          name: item.name,
          stock: product.quantity,
          reason: `Chỉ còn ${product.quantity} sản phẩm`,
        });
      }
    }

    // Nếu có sản phẩm lỗi thì trả về hết luôn!
    if (notEnoughProducts.length > 0) {
      return res.status(400).json({
        message: "Có sản phẩm không đủ số lượng trong kho",
        products: notEnoughProducts,
      });
    }

    //tính giá sản phẩm sau khi acp mã
    let giatien
    
    if(req.body.discount_value){
      giatien = req.body.Intomoney - ((req.body.Intomoney * (req.body.discount_value/100)))
    }

    // Tạo đơn hàng
    const bill = await billModel.create({
      ...req.body,
      Intomoney: giatien,
    });
    if (req.body.code) {
      try{
        
        const response = await axios.post(
        "https://chatapi.io.vn/them-ma-giam-gia-va-nguoi-su-dung",
        {
          order_id: bill._id,
          code: req.body.code,
          phone: bill.phoneNumber,
          order_value: req.body.Intomoney,
        }
      );
      }catch(error){
        return res.json(error.response?.data);
      }
    }

    
    // Trừ tồn kho
    for (const item of productsInOrder) {
      await Product.reduceStock(item.productID, item.quantity);
    }
    if (req.body.useToken) {
      await userModel.updateOne({ uid: req.user.uid }, { $set: { token: 0 } });
    }

    return res.json(bill);
  } catch (error) {
    console.error("❌ Lỗi createBill:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
}

//lấy hóa đơn theo người dùng
const getBillByUser = async (req, res) => {
  const numberPhone = req.user.numberPhone;
  try {
    const bill = await billModel.find({ phoneNumber: numberPhone });
    res.json(bill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
};

//lấy hóa đơn theo mã hóa đơn xem chi tiết hóa đơn
const getBillByCode = async (req, res) => {
  try {
    const bill = await billModel.findById(req.params.id);
    if (!bill)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    const user = await userModel.findOne({ numberPhone: bill.phoneNumber }); // hoặc find nếu muốn lấy mảng

    res.json({ bill, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//sửa trạng thái giao dịch
const updateBillStatus = async (req, res) => {
  try {
    const bill = await billModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          statusPay: "đã thanh toán",
          PaymentForm: "Thanh toán qua ngân hàng",
        },
      }
    );
    res.json(bill);
  } catch (error) {
    console.error(error);
  }
};

// xem tất cả hóa đơn
const getAllBill = async (req, res) => {
  let status = req.query.status || "chờ xác nhận";
  try {
    const bill = await billModel.find({ OrderStatus: status });
    res.json(bill);
  } catch (error) {
    console.error(error);
  }
};

// sửa trạng thái giao dịch
const updateStatus = async (req, res) => {
  try {
    const bill = await billModel.findById(req.params.id);
    console.log(bill);
    if (req.body.OrderStatus === "đã giao hàng") {
      // sửa logic cộng điểm
      const point = Math.floor(bill.Intomoney / 10000) * 0;
      await user.updateOne({ uid: bill.UserUID }, { $inc: { token: point } });
    }

    await billModel.updateOne(
      { _id: req.params.id },
      { $set: { OrderStatus: req.body.OrderStatus } }
    );
    res.json(bill);
  } catch (error) {
    console.error(error);
  }
};

// hủy đơn hàng
const cancelOrder = async (req, res) => {
  try {
    const bill = await billModel.updateMany(
      { _id: req.params.id },
      { $set: { OrderStatus: "hủy đơn hàng" } }
    );

    res.status(201).json({ message: "Successfully Registered" });
  } catch (error) {
    console.error(error);
  }
};

// lấy hóa đơn theo người dùng và trạng thái
const getBillByUserAndStatus = async (req, res) => {
  const numberPhone = req.query.phone;
  try {
    const bill = await billModel.find({ phoneNumber: numberPhone });
    res.json(bill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
};

module.exports = {
  createBill,
  getBillByUser,
  getBillByCode,
  updateBillStatus,
  getAllBill,
  updateStatus,
  cancelOrder,
  getBillByUserAndStatus,
};
