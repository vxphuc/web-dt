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

  if (bufferFromCasso.length !== bufferComputed.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferFromCasso, bufferComputed);
};

module.exports = { isValidCassoSignature };
