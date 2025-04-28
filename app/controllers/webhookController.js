const bills = require("../models/bill");


const handleWebhook = async (req, res) => {
  try {
    
    console.log("Received webhook:", req.body);

    const description = req.body.data.description;
    const descriptionSplit = description.split(" ")[1];

    const bill = await bills.findOne({ _id:  descriptionSplit});
    console.log("Bill found:", bill);
    if(bill._id.toString() !== descriptionSplit){
      return res.status(404).json({ code: 404, message: "Bill not found" });
    }
    return res.status(200).json({ code: 200, message: "OK" });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  handleWebhook,
};
