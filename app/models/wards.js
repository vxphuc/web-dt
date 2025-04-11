const mongoose = require('mongoose');
const { Schema } = mongoose;

const WardsSchema = new Schema({
    IDWards: {
        type: Number,
        required: true,
    },
    nameWards: String,
    IDDistricts: {
        type: Number,
        ref: 'Districts',
        required: true,
    },
});

const Wards = mongoose.model('Wards', WardsSchema, 'Wards');
module.exports = Wards;