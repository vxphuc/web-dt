const billModel = require("../models/bill");
const userModel = require("../models/user");
const Product = require("../models/Product");

//tạo mới hóa đơn
const createBill = async (req, res) => {
  try {
    const productsInOrder = req.body.products;

    // 1. Kiểm tra tồn kho
    for (const item of productsInOrder) {
      const product = await Product.getById(item.productID);
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm "${item.name}" không tồn tại.` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Sản phẩm "${item.name}" chỉ còn ${product.quantity} sản phẩm trong kho.`,
        });
      }
    }

    // 2. Tạo đơn hàng
    const cleanedMoney = Number.parseFloat(
      req.body.Intomoney.split("₫")[0].replace(/\./g, "")
    );

    const bill = await Bill.create({
      UserUID: req.user.uid,
      ...req.body,
      Intomoney: cleanedMoney,
    });

    // 3. Trừ tồn kho
    for (const item of productsInOrder) {
      await Product.reduceStock(item.productID, item.quantity);
    }

    return res.status(200).json(bill);
  } catch (error) {
    console.error("Lỗi tạo đơn:", error);
    return res.status(500).json({ message: "Lỗi xử lý đơn hàng." });
  }
};


//lấy hóa đơn theo người dùng
const getBillByUser = async (req, res) => {
  try {
    const bill = await billModel.find({ UserUID: req.user.uid });
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

    const user = await userModel.findOne({ uid: bill.UserUID }); // hoặc find nếu muốn lấy mảng

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
      { $set: { statusPay: "đã thanh toán" } }
    );
    res.json(bill);
  } catch (error) {
    console.error(error);
  }
};

// xem tất cả hóa đơn
const getAllBill = async (req, res) => {
  let status = req.query.status || 'chờ xác nhận';
  try {
    const bill = await billModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "UserUID",
          foreignField: "uid",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $match: {
          OrderStatus: status,
        }
      },
      {
        $project: {
          _id: 1,
          UserUID: 1,
          Intomoney: 1,
          statusPay: 1,
          createDate: 1,
          OrderStatus: 1,
          road: 1,
          province: 1,
          District: 1,
          ward: 1,
          userInfo: {
            name: "$userInfo.name",
            numberPhone: "$userInfo.numberPhone",
          },
        },
      },
    ]);
    res.json(bill);
  } catch (error) {
    console.error(error);
  }
};

// sửa trạng thái giao dịch
const updateStatus = async (req, res) => {
  try {
    console.log(req.params);
    const bill = await billModel.updateMany(
      { _id: req.params.id },
      { $set: { OrderStatus: req.body.OrderStatus } }
    );
    res.json(bill);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  createBill,
  getBillByUser,
  getBillByCode,
  updateBillStatus,
  getAllBill,
  updateStatus,
};
