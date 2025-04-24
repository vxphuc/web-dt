const validateSignature = require("../../utils/signatureValidator.js");

const handleWebhook = async (req, res) => {
  console.log("Webhook received:", req.body);
  res.status(200).json({ message: "Webhook received successfully" });
};

module.exports = {
  handleWebhook,
};
