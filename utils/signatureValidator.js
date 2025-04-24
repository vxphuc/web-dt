require(`dotenv`).config();

const VALID_TOKEN = process.env.CASSO_SECURE_TOKEN

const validateSignature = (token) => {
    return token === VALID_TOKEN
}

module.exports = { validateSignature }

