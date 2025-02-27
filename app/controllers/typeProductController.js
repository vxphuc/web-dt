const typeProduct = require("../models/typeProduct");
const fs = require("fs");
const path = require("path");
const { default: slugify } = require("slugify");

//xem tất cả sản phẩm chưa được xóa
async function index(req, res, next) {
  const typeProducts = await typeProduct.getAll({ isDelete: false });
  res.json(typeProducts);
}

// POST create new Type
async function create(req, res, next) {
  uploadimg = req.file.filename;
  const typeProductCreate = typeProduct.create({
    ...req.body,
    image: uploadimg,
  });
  res.json(typeProductCreate);
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
    for (let i = 0; i < TypeID.length; i++) {
      const fullPath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "uploads",
        TypeID[i].image
      );
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error("Lỗi khi xóa file:", err);
          return;
        }
        console.log("File đã bị xóa thành công!");
      });
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
    const result = await typeProduct.getAll({_id: req.params.id});
    res.json(result)

  }catch(error){
     console.error(error)
  }

}

//cập nhập loại sản phẩm
async function update(req, res, next) {
  try {
    const updateTypeProduct = await {
      name: req.body.name,
      slug: slugify(req.body.name),
    };
    if (req.file) {
      const TypeID = await typeProduct.getAll({ _id: req.params.id });
      const pathImg = await path.join(__dirname, '..','..', 'public', 'uploads', TypeID.image);
      
    }
    console.log(updateTypeProduct);
    res.json("hello");
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
