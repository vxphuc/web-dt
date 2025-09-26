
const typeProduct = require("../models/typeProduct");
const fs = require("fs");
const path = require("path");
const { default: slugify } = require("slugify");
const cloudinary = require('../../config/cloudinaryConfig')

//xem tất cả sản phẩm chưa được xóa
async function index(req, res, next) {
  try{
    const [typeProducts, countDelete] = await Promise.all([
      typeProduct.getAll({isDelete: false}),
      typeProduct.count({isDelete: true})
    ])
    res.json( {typeProducts: typeProducts, count: countDelete} );
  }catch{
    console.log("lỗi truy vấn")
  }

}

// POST create new Type
async function create(req, res, next) {
  try{
    uploadimg = req.file.path;
  const uploadCloudinary = await cloudinary.uploader.upload(uploadimg, 
    {
      folder: "typeProduct",
    }
  );
  fs.unlink(uploadimg, (err) => {
    if (err) {
        console.error('Lỗi khi xóa file:', err);
        return;
    }
    console.log('File đã được xóa thành công');
});
  console.log(uploadCloudinary)
  const typeProductCreate = typeProduct.create({
    ...req.body,
    image: uploadCloudinary.secure_url,
  });
  res.json(typeProductCreate);
  }catch(err){
    console.log("lỗi")
    res.json("lỗi")
  }
}

//Path xóa mềm
async function deleteSort(req, res, next) {
  const result = await typeProduct.update(
    { _id: req.params.id },
    { isDelete: true, deleteAt: Date.now() }
  );
  res.json(result);
}

//xem các sản phẩm đã xóa
async function GetdeleteTypeProduct(req, res, next) {
  try {
    const result = await typeProduct.getAll({ isDelete: true });
    res.json(result);
  } catch (error) {
    console.error(error);
  }
}

//khôi phục loại sản phẩm đã xóa
async function restore(req, res, next) {
  try {
    const result = await typeProduct.update(
      { _id: req.params.id },
      { isDelete: false, deleteAt: null }
    );
    res.json(result);
  } catch (error) {
    console.error(error);
  }
}

//xóa vĩnh viễn
async function deleteForever(req, res, next) {
  try {
    const TypeID = await typeProduct.getAll({ _id: req.params.id });
    for(let x of TypeID){
      const imagePath = x.image;
      const imgArr = imagePath.split('/').slice(-2);
      const fullPath = imgArr.join('/').split('.')[0];
      await cloudinary.uploader.destroy(fullPath);
    }
    const result = await typeProduct.deleteMany({ _id: req.params.id });
    res.json(result);
  } catch (error) {
    console.error(error);
  }
}

//xem chi tiết loại sản phẩm
async function detail(req, res, next) {
  try {
    const result = await typeProduct.getAll({slug: req.params.slug});
    res.json(result)

  }catch(error){
     console.error(error)
  }

}

//cập nhập loại sản phẩm
async function update(req, res, next) {
  try {
    const updateTypeProduct = {
      name: req.body.name,
      slug: slugify(req.body.name),
    };
    const TypeID = await typeProduct.getAll({_id: req.params.id});
    
     if(req.file){
      for (const element of TypeID) {
        const imagePath = element.image;
        const imgArr = imagePath.split('/').slice(-2);
        const fullPath = imgArr.join('/').split('.')[0];
        await cloudinary.uploader.destroy(fullPath);
      }

      const img = req.file.path
      const uploadCloudinary = await cloudinary.uploader.upload(img , 
        {
          folder: 'typeProduct',
        }
      )
      updateTypeProduct.image = uploadCloudinary.secure_url
      fs.unlinkSync(img)
    }
    const result = await typeProduct.update({ _id: req.params.id }, updateTypeProduct)
    res.json(result);
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  create,
  index,
  deleteSort,
  GetdeleteTypeProduct,
  restore,
  deleteForever,
  update,
  detail,
};
