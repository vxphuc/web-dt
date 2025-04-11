const mongoose = require('mongoose');
const { Schema } = mongoose;

const DistrictsSchema = new Schema({
    IDDistricts: {
        type: Number,
        required: true,
    },
    nameDistricts: String,
    IDProvinces: {
        type: Number,
        ref: 'Provinces',
        required: true,
    },
});

const Districts = mongoose.model('Districts', DistrictsSchema, 'Districts');
module.exports = Districts;