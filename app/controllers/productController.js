const ProductRepository = require("../models/product");
const fs = require("fs");
const path = require("path");
const slugify = require("slugify");

//Get product not delete
async function index(req, res, next) {
  const products = await ProductRepository.getAllWithJoin([
    {
      $match: {
        isDeleted: null,
      },
    },
    {
      $lookup: {
        from: "typeproducs", // Tên collection cần nối
        localField: "typeProductId", // Trường khóa chính (FK)
        foreignField: "_id", // Trường trong collection kia
        as: "typeProduct", // Tên biến chứa dữ liệu sau khi join
      },
    },
  ]);
  const formattedProducts = products.map((product) => {
    return {
      ...product,
      price: product.price.toString(),
    };
  });
  const deleteProduct = await ProductRepository.countProduct({
    isDeleted: true,
  });
  Promise.all([formattedProducts, deleteProduct]).then((results) => {
    res.json({
      results: results[0],
      count: results[1],
    });
  });
}

//create post
async function create(req, res, next) {
  const imageeName = req.file.filename;
  const product = await ProductRepository.create({
    image: imageeName,
    ...req.body,
  });
  res.json(product);
}

//Patch destroy soft-delete
function destroy(req, res, next) {
  const product = ProductRepository.updateoneFiled(
    { _id: req.params.id },
    { $set: { isDeleted: true, deletedAt: new Date()} }
  );
  res.json(product);
}

//Get product delete
async function RecycleBin(req, res, next) {
  const productDelete = await ProductRepository.getAllWithJoin([
    { $match: { isDeleted: true } },
    {
      $lookup: {
        from: "typeproducs",
        localField: "typeProductId",
        foreignField: "_id",
        as: "typeProduct",
      },
    },
  ]);
  const products = await productDelete.map((product) => {
    return {
      ...product,
      price: product.price.toString()
    };
  });
  res.json(products);
}

//Patch restore
function Restore(req, res, next) {
  ProductRepository.updateoneFiled(
    { _id: req.params.id },
    { $set: { isDeleted: null, deletedAt: null } }
  )
    .then((product) => res.json(product))
    .catch(next);
}

//delete product
async function Delete(req, res, next) {
  try {
    //xóa ảnh trong file
    const product = await ProductRepository.getAll({
      isDeleted: true,
      _id: req.params.id,
    });
    for (let i = 0; i < product.length; i++) {
      imgpath = path.join(__dirname, "..", "..", "public" ,"uploads", product[i].image);
      fs.unlink(imgpath, (err) => {
        if (err) {
          console.log(`Lôi khi xóa tệp ${err}`);
        } else {
          console.log("Xóa tệp thành công");
        }
      });
    }

    //xóa dữ liệu trong monggoDB
    await ProductRepository.deleteProduct({ _id: req.params.id })
      .then(() => {
        res.json({ message: "succcess" });
      })
      .catch(next);
  } catch {
    res.json({ message: "error" });
  }
}

//sửa sản phẩm
async function fixProduct(req, res, next) {
  try {
    const updateProduct = await {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      quantity: req.body.quantity,
      typeProductId: req.body.typeProductId,
      slug: slugify(req.body.name),
    };
    if (req.file) {
      const product = await ProductRepository.getAll({ _id: req.params.id });
      
      for (let x of product) {
        const imgpath = path.join(__dirname, "../../public/uploads", x.image);
        
        fs.unlink(imgpath, (err) => {
          if (err) {
            console.log(`Lỗi khi xóa tệp ${err}`);
            return;
          } else {
            console.log("File đã được xóa thành công");
          }
        });
      }
      updateProduct.image = req.file.filename;
    }

    const doc = await ProductRepository.update(
      { _id: req.params.id },
      updateProduct,
      { new: true }
    );
    if (doc) {
      res.json(doc);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    console.log(req.params.id);
    res.status(500).json({ message: "Error", error: err.message });
  }
}

//xem chỉ tiết sản phẩm
async function show(req, res, next) {
  const products = await ProductRepository.getAllWithJoin([
    { $match: { slug: req.params.slug } },
    {
      $lookup: {
        from: "typeproducs", // Tên collection cần join
        localField: "typeProductId", // Trường trong collection hiện tại
        foreignField: "_id", // Trường trong collection khác
        as: "Typeproduct", // Tên mảng chứa dữ liệu trả về từ join
      },
    },
  ]);
  const formatProducts = products.map((item) => {
    return {
      ...item,
      price: item.price.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    };
  });
  await res.json(formatProducts);
}

module.exports = {
  index,
  create,
  destroy,
  RecycleBin,
  Restore,
  Delete,
  fixProduct,
  show,
};
