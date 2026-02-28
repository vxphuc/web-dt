const mongoose = require('mongoose')
const { Schema } = mongoose

const refresh_token_zalo_schemal = new Schema({
    name: String,
    token: String,
    accessToken: String,
    accessTokenExpiresAt: Date,
})

const refresh_token_zalo = mongoose.model('Refresh_token_zalo', refresh_token_zalo_schemal)

module.exports = refresh_token_zalo