const mongoose = require('mongoose');
function connect() {
    mongoose.connect('mongodb+srv://hkmediadtgroup:hkmedia@dtshop.ryjmkoe.mongodb.net/?retryWrites=true&w=majority&appName=DTShop')
        .then(() => console.log('Connected!'));
}

module.exports = { connect };