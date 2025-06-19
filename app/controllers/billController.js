const billModel = require("../models/bill");
const userModel = require("../models/user");
const Product = require("../models/product");
const user = require("../models/user");

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

    // Tạo đơn hàng
    const IntomoneySplit = req.body.Intomoney.split("₫");
    const cleanedMoney = Number.parseFloat(
      IntomoneySplit[0].replace(/\./g, "")
    );

    const bill = await billModel.create({
      UserUID: req.user.uid,
      ...req.body,
      Intomoney: cleanedMoney,
    });

    // Trừ tồn kho
    for (const item of productsInOrder) {
      await Product.reduceStock(item.productID, item.quantity);
    }

    return res.json(bill);
  } catch (error) {
    console.error("❌ Lỗi createBill:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
}

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
  let status = req.query.status || "chờ xác nhận";
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
        },
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
    console.log(req.body.OrderStatus);
    const bill = await billModel.findById(req.params.id);
    console.log(bill);
    if (req.body.OrderStatus === "đã giao hàng") {
      const point = Math.floor(bill.Intomoney / 10000) * 0.5;
      console.log(point);
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

module.exports = {
  createBill,
  getBillByUser,
  getBillByCode,
  updateBillStatus,
  getAllBill,
  updateStatus,
  cancelOrder,
};
