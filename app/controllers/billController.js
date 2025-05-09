const billModel = require("../models/bill");
const userModel = require("../models/user");

//tạo mới hóa đơn
async function createBill(req, res) {
  try {
    console.log(req.body);
    const IntomoneySplit = req.body.Intomoney.split("₫");
    const cleanedMoney = Number.parseFloat(IntomoneySplit[0].replace(/\./g, ""));
    const bill = await billModel.create({
      UserUID: req.user.uid,
      ...req.body,
      Intomoney: cleanedMoney,
    });
    res.json(bill);
  } catch (error) {
    console.error(error);
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
    const bill = await billModel.findOne({ _id: req.params.id });
    const user = await userModel.find({uid: bill.UserUID});
    res.json(bill, user);
  } catch (error) {
    console.error(error);
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
}

// sửa trạng thái giao dịch
const updateStatus = async (req, res) => {
  try {
    console.log(req.params);
    const bill = await billModel.updateMany(
      { _id: req.params.id },
      { $set: { OrderStatus: req.body.OrderStatus } }
    )
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
