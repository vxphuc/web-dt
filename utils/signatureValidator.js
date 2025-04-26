require(`dotenv`).config();
const crypto = require('crypto');


const VALID_TOKEN = process.env.CASSO_SECURE_TOKEN

const isValidCassoSignature = (body, signatureFromCasso) => {
    const computedSignature  = crypto
        .createHmac('sha256', VALID_TOKEN)
        .update(JSON.stringify(body))
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signatureFromCasso, 'hex'),
        Buffer.from(computedSignature, 'hex')
    );
}

module.exports = { isValidCassoSignature }

