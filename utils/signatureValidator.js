require(`dotenv`).config();
const crypto = require("crypto");

const VALID_TOKEN = process.env.CASSO_SECURE_TOKEN;

const isValidCassoSignature = (body) => {
  const timestamp = Date.now().toString();

  const payload = `${timestamp}.${JSON.stringify(body)}`;

  const signature = crypto
    .createHmac("sha256", VALID_TOKEN)
    .update(payload)
    .digest("hex");

  const xCassoSignature = `t=${timestamp},v1=${signature}`;

  // Gửi request bằng axios
  axios
    .post("http://localhost:8080/api/webhook-event-handler", body, {
      headers: {
        "Content-Type": "application/json",
        "X-Casso-Signature": xCassoSignature,
      },
    })
    .then((response) => {
      console.log("✅ Server response:", response.data);
    })
    .catch((error) => {
      console.error(
        "❌ Error sending webhook:",
        error.response?.data || error.message
      );
    });
};

module.exports = { isValidCassoSignature };
