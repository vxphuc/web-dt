const mongoose = require('mongoose');
const { Schema } = mongoose;

const DistrictsSchema = new Schema({
    IDDistricts: {
        type: Number,
        required: true,
    },
    name: String,
    IDProvinces: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provinces',
        required: true,
    },
});

const Districts = mongoose.model('Districts', DistrictsSchema, 'Districts');
module.exports = Districts;