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

    return res.status(200).json({ code: 200, message: "OK", data: Bank });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  handleWebhook,
};
