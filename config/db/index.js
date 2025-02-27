const mongoose = require('mongoose');
function connect() {
    mongoose.connect('mongodb+srv://vinh2711:vinhthe@dtshop.ehyii.mongodb.net/dtShop')
        .then(() => console.log('Connected!'));
}

module.exports = { connect };