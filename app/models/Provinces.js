const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProvincesSchema = new Schema({
    IDProvinces: {
        type: Number,
        required: true,
    },
    nameProvinces: String,
})

const Provinces = mongoose.model('Provinces', ProvincesSchema, 'Provinces');

module.exports = Provinces;