const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify')
const ProductRepository = require('../repositories/ProductRepository');
const { image } = require('../../config/cloudinaryConfig');


const product = new Schema({
    name: String,
    price: mongoose.Schema.Types.Decimal128,
    description: String,
    typeProductId: {type: Schema.Types.ObjectId, ref: 'typeProducs'},
    quantity: {type: Number, default: 0},
    isDeleted: { type: Boolean, default: null },
    deletedAt: { type: Date, default: null },
    image: [{ type: String }],
    slug: String,
    createdAt: { type: Date, default: Date.now },
    discount: Number,
    priceDiscount: mongoose.Schema.Types.Decimal128
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
    async getById(id) {
    return await this.model.findById(id).exec();
  }

  async reduceStock(id, quantity) {
    return await this.model.findByIdAndUpdate(
      id,
      { $inc: { quantity: -quantity } },
      { new: true }
    );
}
}  

module.exports = new ProductModel(Product)