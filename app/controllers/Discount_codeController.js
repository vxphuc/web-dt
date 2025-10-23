const { default: axios } = require("axios")

const giaTriMaGiam = async (req, res) =>{
    const response = await axios.post('https://chatapi.io.vn/gia-tri-ma-giam',{
        code : req.body.code,
        phone: req.body.phone
    })
    if(response.data == ""){
        res.json({value: "mã giảm giá không hợp lệ"})
    }else{
        res.status(200).json({value : response.data})
    }
    
}

module.exports = {
    giaTriMaGiam
}