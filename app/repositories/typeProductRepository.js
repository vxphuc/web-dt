class typeProductRepository{
    constructor(model){
        this.model = model;
    }

    //tạo mới loại sản phẩm
    async create(data){
        const result = await this.model.create(data);
        return result
    }
    
    //xem tất cả loại sản phẩm
    async getAll(data){
        const result = await this.model.find(data).exec();
        return result
    }

    //cập nhập loại sản phẩm
    async update(id, data){
        const result = await this.model.updateOne(id, {$set: data});
        return result
    }

    //xóa nhiều sản phẩm dựa trên điều kiện
    async deleteMany(data){
         const result = await this.model.deleteMany(data).exec();
         return result
    }
    //đếm số lượng loại sản phẩm 
    async count(data){
        const result = await this.model.countDocuments(data).lean()
        return result
    }
}


module.exports = typeProductRepository;