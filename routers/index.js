
const productRouter = require('./product');
const typeProductRouter = require('./typeProduct');
const auth = require('./auth')


function router(app){
    app.use('/product', productRouter)
    app.use('/typeProduct', typeProductRouter)
    app.use('/sign-in', auth)
}

module.exports = router;