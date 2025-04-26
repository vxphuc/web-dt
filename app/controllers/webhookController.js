const ValidateSignature = require("../../utils/signatureValidator.js");

const handleWebhook = async (req, res) => {
  console.log("Headers:", req.headers)
  const signature  = req.headers[`X-Casso-Signature`]
  if (!ValidateSignature.isValidCassoSignature(req.body, signature)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  console.log("Webhook received:", req.body);
  res.status(200).json({ message: "Webhook received successfully" });
};

module.exports = {
  handleWebhook,
};
