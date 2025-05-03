const billModel = require("../models/bill");
const userModel = require("../models/user");

//tạo mới hóa đơn
async function createBill(req, res) {
  try {
    console.log(req.body);
    const IntomoneySplit = req.body.Intomoney.split("₫");
    const Intomoney = IntomoneySplit[0].replace(/\./g, "");
    const bill = await billModel.create({
      UserUID: req.user.uid,
      ...req.body,
      Intomoney: Intomoney,
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

//lấy hóa đơn theo mã hóa đơn
const getBillByCode = async (req, res) => {
  try {
    const bill = await billModel.findOne({ _id: req.params.id });
    res.json(bill);
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

module.exports = {
  createBill,
  getBillByUser,
  getBillByCode,
  updateBillStatus,
};
