
const productRouter = require('./product');
const typeProductRouter = require('./typeProduct');
const auth = require('./auth')
const ReviewFormRouter = require('./reviewForm')
const cartRouter = require('./cart')
const addressRouter = require('./adress')


function router(app){
    app.use('/ReviewForm', ReviewFormRouter)
    app.use('/product', productRouter)
    app.use('/typeProduct', typeProductRouter)
    app.use('/sign-in', auth)
    app.use('/cart', cartRouter)
    app.use('/address', addressRouter)
}

module.exports = router;