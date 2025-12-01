const mongoose = require("mongoose");
const schema = mongoose.Schema

const phoneEvent = new schema({
    name: String,
    phone: String,
    company: String,
    email: String
});

const PhoneEvent = mongoose.model("phoneEvent", phoneEvent);

module.exports = PhoneEvent;