const { default: axios } = require("axios")

const giaTriMaGiam = async (req, res) =>{
    try{
        const response = await axios.post('https://kocapi.io.vn/su-dung-ma-giam-gia',{
        code : req.body.code,
        phone: req.body.phone
    })
    if(response.data == ""){
        res.json({value: "mã giảm giá không hợp lệ"})
    }else{
        res.status(200).json({value : response.data})
    }
    }catch(error){
        res.status(422).json({err: "mã giảm giá đã được sử dụng"})
    }
    
}

module.exports = {
    giaTriMaGiam
}