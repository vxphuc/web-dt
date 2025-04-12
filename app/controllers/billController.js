const billModel = require("../models/bill");

//tạo mới hóa đơn
async function createBill(req, res) {
  try {
    const bill = await billModel.create({UserUID: req.user.uid, ...req.body })
    res.json(bill);
  } catch (error) {
    console.error(error);
  }
}

//lấy hóa đơn theo người dùng
const getBillByUser = async (req, res) => {
  try{
    const bill = await billModel.find({UserUID: req.user.uid})
    res.json(bill)

  }catch (error){
    console.error(error);
    res.status(500).json({message: error});
  }
}

module.exports = {
  createBill,
  getBillByUser
};
