const { messaging } = require("firebase-admin");
const PhoneEvent = require("../models/event");
const event = PhoneEvent

const saveInformation = async (req, res) =>{
    try{
        const savenumperphone = await new event(req.body);
        await savenumperphone.save();
        res.json("thêm thành công")
    }catch(err){
        console.log(err);
    };
}

module.exports ={
    saveInformation
}