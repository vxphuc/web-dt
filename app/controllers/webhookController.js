const ValidateSignature = require("../../utils/signatureValidator.js");

const handleWebhook = async (req, res) => {

  const signatureHeader = req.headers["x-casso-signature"];

  if (!signatureHeader) {
    return res.status(400).json({ message: "Missing signature" });
  }

  // Parse timestamp và signature từ header
  const parts = signatureHeader.split(",");
  const timestampPart = parts.find((p) => p.trim().startsWith("t="));
  const signaturePart = parts.find((p) => p.trim().startsWith("v1="));

  console.log("Signature Header:", signatureHeader);
  console.log("Timestamp Part:", timestampPart);

  if (!timestampPart || !signaturePart) {
    return res.status(400).json({ message: "Invalid signature format" });
  }

  const timestamp = timestampPart.split("=")[1];
  const signature = signaturePart.split("=")[1];

  // Kiểm tra chữ ký
  if (!isValidCassoSignature(req.body, signature, timestamp)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  console.log("✅ Webhook received and verified:", req.body);
  res.status(200).json({ message: "Webhook received successfully" });
};

module.exports = {
  handleWebhook,
};
