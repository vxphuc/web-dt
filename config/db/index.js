const mongoose = require('mongoose');
function connect() {
    mongoose.connect('mongodb+srv://hkmediadtgroup:vnE7eYeTNuQ5aJmt@cluster0.3lrfdio.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
        .then(() => console.log('Connected!'));
}

module.exports = { connect };