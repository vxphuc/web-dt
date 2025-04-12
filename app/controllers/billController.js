const billModel = require("../models/bill");

//tạo mới hóa đơn
function createBill(req, res) {
  try {
    const bill = insertOne(req.body);
    console.log(req.body)
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  createBill,
};
