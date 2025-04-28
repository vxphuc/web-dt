const bank = require("../models/bank");

const handleWebhook = async (req, res) => {
  try {
    
    console.log("Received webhook:", req.body);

    const description = req.body.data.description;
    const descriptionSplit = description.split(" ")[1];
    const Bank = new bank({
      id: req.body.data.id,
      transactionDateTime: req.body.data.transactionDateTime,
      description: descriptionSplit,
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

    console.log("Received check:", id);
    const bankData = await bank.findOne({ description: id });
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
