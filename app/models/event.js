const mongoose = require("mongoose");
const schema = mongoose.Schema

const phoneEvent = new schema({
    phone: String
});

const PhoneEvent = mongoose.model("phoneEvent", phoneEvent);

module.exports = PhoneEvent;