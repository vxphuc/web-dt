const bank = require("../models/bank");
const bill = require("../models/bill");

const handleWebhook = async (req, res) => {
  try {
    console.log("Received webhook:", req.body);
    const description = req.body.data.description;
    // Regex tìm mã MongoDB 24 ký tự
    const match = description.match(/[a-f0-9]{24}/i);
    const orderId = match ? match[0] : null;
    const Bank = new bank({
      id: req.body.data.id,
      transactionDateTime: req.body.data.transactionDateTime,
      description,
      orderId,
      amount: req.body.data.amount,
    });

    await Bank.save();

    return res.status(200).json({ code: 200, message: "OK", data: Bank });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const handlecheck = async (req, res) => {
  try {
    const {id}  = req.body;
    const bankData = await bank.findOne({ orderId: id });
    if (!bankData) {
      console.log("Bank data not found for id:", id);
      return res.status(404).json({ code: 404, message: "Not Found" });
    }
    return res.status(200).json({ code: 200, message: "OK", data: bankData });
  } catch (error) {
    console.error("Error handling check:", error);
    return res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  handleWebhook,
  handlecheck
};
