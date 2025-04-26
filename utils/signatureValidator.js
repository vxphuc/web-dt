require(`dotenv`).config();
const crypto = require("crypto");

const VALID_TOKEN = process.env.CASSO_SECURE_TOKEN;

const isValidCassoSignature = (body, timestamp, signatureFromCasso) => {

  const payload = `${timestamp}.${JSON.stringify(body)}`;

  const signature = crypto
    .createHmac("sha256", VALID_TOKEN)
    .update(payload)
    .digest("hex");

  const sig1 = Buffer.from(signatureFromCasso, 'hex');
  const sig2 = Buffer.from(signature, 'hex');

  if (sig1.length !== sig2.length) {
    return false;
  }

  return crypto.timingSafeEqual(sig1, sig2);

};

module.exports = { isValidCassoSignature };
