const ValidateSignature = require("../../utils/signatureValidator.js");

const handleWebhook = async (req, res) => {
  const secureToken = req.headers[`secure-token`]
  if (!ValidateSignature.validateSignature(secureToken)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  console.log("Webhook received:", secureToken);
  res.status(200).json({ message: "Webhook received successfully" });
};

module.exports = {
  handleWebhook,
};
