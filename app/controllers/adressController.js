const Wards = require('../models/wards');
const Districts = require('../models/districts');
const province = require('../models/Provinces');
const road = require('../models/road');

const createAddress = async (req, res) => {
    try {
        const Province = new province(req.body)
        const district = new Districts(req.body)
        const ward = new Wards(req.body)
        const Road = new road({userUID: req.user.uid, ...req.body})

        await Province.save()
        await district.save()
        await ward.save()
        await Road.save()
        res.status(201).json({message: 'Address created successfully', data: req.body})
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

//xem địa chỉ
const getAdress = async (req, res) => {
    try {
        const address = await road.aggregate([
            {
                $match: {userUID: req.user.uid}
            },
            {
                $lookup: {
                    from: 'Wards',
                    localField: 'idWards',
                    foreignField: 'IDWards',
                    as: 'wards'
                }
            },
            {
                $unwind: "$wards"
            },{
                $lookup: {
                    from: 'Districts',
                    localField: 'wards.IDDistricts',
                    foreignField: 'IDDistricts',
                    as: 'districts'
                }
            },{
                $unwind: "$districts"
            },{
                $lookup: {
                    from: 'Provinces',
                    localField: 'districts.IDProvinces',
                    foreignField: 'IDProvinces',
                    as: 'provinces'
                }
            },
            {
                $unwind: "$provinces"
            },
            {
                $group: {
                    _id: "$_id",
                    nameRoad: { $first: "$nameRoad" },
                    idWards: { $first: "$idWards" },
                    userUID: { $first: "$userUID" },
                    wards: { $first: "$wards" },
                    districts: { $first: "$districts" },
                    provinces: { $first: "$provinces" },
                    // Nếu có field khác muốn trả về thì bổ sung ở đây
                }
            }
        ])
        res.json(address)
    }catch (error) {
        console.log(error);
    }
}

const deleteAddress = async (req, res) => {
    try{
        roadDelete = await road.deleteOne({_id: req.params.roadId})
        wardelete = await Wards.deleteOne({_id: req.params.wardId})
        disdelete = await Districts.deleteOne({_id: req.params.districtId})
        provdelete = await province.deleteOne({_id: req.params.provinceId})
        res.json(roadDelete)

    }catch (error) {
        console.log(error);
    }
}

// controllers/address.js

const getUserAddress = async (req, res) => {
    const { uid } = req.params;
    try {
        const address = await road.aggregate([
            {
                $match: { userUID: uid }
            },
            {
                $lookup: {
                    from: 'Wards',
                    localField: 'idWards',
                    foreignField: 'IDWards',
                    as: 'wards'
                }
            },
            { $unwind: "$wards" },
            {
                $lookup: {
                    from: 'Districts',
                    localField: 'wards.IDDistricts',
                    foreignField: 'IDDistricts',
                    as: 'districts'
                }
            },
            { $unwind: "$districts" },
            {
                $lookup: {
                    from: 'Provinces',
                    localField: 'districts.IDProvinces',
                    foreignField: 'IDProvinces',
                    as: 'provinces'
                }
            },
            { $unwind: "$provinces" },
            // ------- CHỐT BẰNG GROUP ĐỂ LOẠI LẶP -------
            {
                $group: {
                    _id: "$_id",
                    nameRoad: { $first: "$nameRoad" },
                    idWards: { $first: "$idWards" },
                    userUID: { $first: "$userUID" },
                    wards: { $first: "$wards" },
                    districts: { $first: "$districts" },
                    provinces: { $first: "$provinces" },
                    // Nếu có field khác muốn trả về thì bổ sung ở đây
                }
            }
        ]);
        res.json(address);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Lỗi truy vấn địa chỉ người dùng." });
    }
}

module.exports = { getUserAddress };


module.exports = {
    createAddress,getAdress,deleteAddress,getUserAddress
}