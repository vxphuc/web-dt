const ValidateSignature = require("../../utils/signatureValidator.js");

const handleWebhook = async (req, res) => {

  const signatureHeader = req.headers["x-casso-signature"];
  console.log("Body received from Casso:", JSON.stringify(req.body));

  if (!signatureHeader) {
    return res.status(400).json({ message: "Missing signature" });
  }

  // Parse timestamp và signature từ header
  const parts = signatureHeader.split(",");
  const timestampPart = parts.find((p) => p.trim().startsWith("t="));
  const signaturePart = parts.find((p) => p.trim().startsWith("v1="));

  if (!timestampPart || !signaturePart) {
    return res.status(400).json({ message: "Invalid signature format" });
  }

  const timestamp = timestampPart.split("=")[1];
  const signature = signaturePart.split("=")[1];

  // Kiểm tra chữ ký
  if (!ValidateSignature.isValidCassoSignature(req.body, timestamp ,signature)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  
  res.status(200).json({ code: 200, message: "OK" });
};

module.exports = {
  handleWebhook,
};
