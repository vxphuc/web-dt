class ProductRepository{
    constructor(model){
        this.model = model;
    }

    //tạo mới 1 collection
    async create(data){
        const result = await this.model.create(data);
        return result
    }

    // lấy 10 sản phẩm mới nhất
    async getNewProduct(data){
        const result = await this.model.find(data).sort({createdAt: -1}).limit(10).exec();
        return result
    }

    //xem tất cả các collecttion
    async getAll(data){
        const result = await this.model.find(data).exec();
        return result
    }

    //sửa sản phẩm
    async update(filter, update, options){
        const result = await this.model.findOneAndUpdate(filter, update, options);
        return result
    }

    //update 1 trường sản phẩm
    async updateoneFiled(filter, update){
        const result = await this.model.updateOne(filter, update)
        return result
    }

    //xem tất cả sản phẩm không bị xóa mềm
    async getAllWithJoin(data){
        const result = await this.model.aggregate(data).limit(5).exec();
        return result
    }
    //đếm số lượng sản phẩm
    async countProduct (number){
        const result = await this.model.countDocuments(number)
        return result
    }

    //xóa 1 colection trong monggo
    async deleteProduct (id){
        const result = await this.model.deleteOne(id)
    }
}

module.exports = ProductRepository;