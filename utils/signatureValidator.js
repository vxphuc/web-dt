require(`dotenv`).config();
const crypto = require("crypto");

const VALID_TOKEN = process.env.CASSO_SECURE_TOKEN;

const isValidCassoSignature = (rawBody, timestamp, signatureFromCasso) => {
  const payload = `${timestamp}.${rawBody}`;

  const signature = crypto
    .createHmac("sha256", VALID_TOKEN)
    .update(payload)
    .digest("hex");

  const bufferFromCasso = Buffer.from(signatureFromCasso, "hex");
  const bufferComputed = Buffer.from(signature, "hex");

  if (sig1.length !== sig2.length) {
    return false;
  }

  return crypto.timingSafeEqual(sig1, sig2);
};

module.exports = { isValidCassoSignature };
