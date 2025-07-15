const mongoose = require('mongoose');
function connect() {
    mongoose.connect('mongodb+srv://hkmediadtgroup:41iofkP4SrmA49wk@cluster0.3lrfdio.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
        .then(() => console.log('Connected!'));
}
// mongodb+srv://hkmediadtgroup:41iofkP4SrmA49wk@cluster0.3lrfdio.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

module.exports = { connect };