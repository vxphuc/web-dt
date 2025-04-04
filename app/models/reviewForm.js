const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReviewForm = new Schema({
    rate: {type: Number},
    comment :{type: String, maxlength: 300},
    name: {type: String, maxlength: 30},
    phone: {type: String, maxlength: 10},
    createdAt: { type: Date, default: Date.now },
    productID : {type: Schema.Types.ObjectId, ref: 'Products'},
})

const Review = mongoose.model('Review', ReviewForm)

module.exports = Review;