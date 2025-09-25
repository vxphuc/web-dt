const { messaging } = require("firebase-admin");
const PhoneEvent = require("../models/event");
const event = PhoneEvent

const savePhone = async (req, res) =>{
    try{
        const savenumperphone = await new event({phone: req.body.phone});
        await savenumperphone.save();
        res.json("thêm thành công")
    }catch(err){
        console.log(err);
    };
}

module.exports ={
    savePhone
}