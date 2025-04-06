const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    uid: {type: String, required: true},
    numberPhone: {type: String},
    name: {type: String, default: null},
    gender: {type: String, enum: ['nam', 'nữ'], default: null},
    role: {
        type: String,
        enum: ['admin', 'editor', 'user'],
        required: true,
        default: 'user'
      },
    createDate: {type: Date, default: Date.now},
    communeCode : {type: Schema.Types.ObjectId},
    token: {type: Number, default: 0},
  });

  module.exports = mongoose.model('User', user);