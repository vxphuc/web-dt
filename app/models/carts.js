
// File: app/models/carts.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const CartSchema = new Schema({
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
        required: true,
    },
    totalAmount: {
        type: Number,
    },
    userID: {
        type: String,
        ref: 'User',
    },
    roadID: {
        type: mongoose.Schema.Types.ObjectId,
    },
    alternateReceiverPhone: {
        type: String,
        default: '',
    },
    alternateReceiverName: {
        type: String,
        default: '',
    },

});

module.exports = mongoose.model('carts', CartSchema);