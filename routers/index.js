
const productRouter = require('./product');
const typeProductRouter = require('./typeProduct');
const auth = require('./auth')
const ReviewFormRouter = require('./reviewForm')
const cartRouter = require('./cart')
const addressRouter = require('./adress')
const billRouter = require('./bill')
const webhookRouter = require('./webhook')
const chartRouter = require('./Chart')
const chatbotRouter = require('./chatbot')
const Discount_code = require('./Discount_code')
const brochureRouter = require('./brochure') // TODO: Fix uploadPDF module not found


function router(app){
    app.use('/ReviewForm', ReviewFormRouter)
    app.use('/product', productRouter)
    app.use('/typeProduct', typeProductRouter)
    app.use('/sign-in', auth)
    app.use('/cart', cartRouter)
    app.use('/address', addressRouter)
    app.use('/bill', billRouter)
    app.use('/webhook', webhookRouter)
    app.use('/chart', chartRouter)
    app.use('/chatbot', chatbotRouter)
    app.use('/discount-code', Discount_code)
    app.use('/brochure', brochureRouter) // TODO: Fix uploadPDF module not found
}

module.exports = router;