const mongoose = require('mongoose');
const slugify = require('slugify')
const typeProductRepository = require('../repositories/typeProductRepository')

const typeProduc = new mongoose.Schema({
    name: String,
    image: String,
    slug: String,
    isDelete: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now},
    deleteAt: {type: Date, default: null}
})

typeProduc.pre('save', async function(next){
    this.slug = await slugify(this.name)
})

const typeProduct = mongoose.model('typeProduc', typeProduc)

class TypeProduct extends typeProductRepository{
    constructor(typeProduct){
        super(typeProduct)
    }
}

module.exports = new TypeProduct(typeProduct)