const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify')
const ProductRepository = require('../repositories/ProductRepository')


const product = new Schema({
    name: String,
    price: mongoose.Schema.Types.Decimal128,
    description: String,
    typeProductId: {type: Schema.Types.ObjectId, ref: 'typeProducs'},
    quantity: {type: Number, default: 0},
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: false },
    image: {type: String, default: '' },
    slug: String
});

//gán document cho slug
product.pre("save", function middleware(){
    this.slug = slugify(this.name, { lower: true, strict: true })
})



const Product = mongoose.model('Product', product);

class ProductModel extends ProductRepository {
    constructor(Product) {
        super(Product)
    }
}  

module.exports = new ProductModel(Product)