
// File: app/models/carts.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const CartSchema = new Schema({
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
        required: true,
    },
    IDWards: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wards',
    },
    totalAmount: {
        type: Number,
    },
    userID: {
        type: String,
        ref: 'users',
    },
});

module.exports = mongoose.model('carts', CartSchema);