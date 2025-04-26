const ValidateSignature = require("../../utils/signatureValidator.js");

const handleWebhook = async (req, res) => {
  console.log("Headers:", req.headers)
  if (!ValidateSignature.isValidCassoSignature(req.body)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  console.log("Webhook received:", req.body);
  res.status(200).json({ message: "Webhook received successfully" });
};

module.exports = {
  handleWebhook,
};
