const Wards = require('../models/wards');
const Districts = require('../models/districts');
const province = require('../models/Provinces');

const createAddress = async (req, res) => {
    try {
        res.json('ok')
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createAddress,
}