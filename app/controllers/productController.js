const ProductRepository = require("../models/product");
const fs = require("fs");
const slugify = require("slugify");
const cloudinary = require('../../config/cloudinaryConfig')

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
  const imageeName = req.file.path;
  const uploadResult = await cloudinary.uploader.upload(imageeName, {
    folder: 'products'
  })
  fs.unlinkSync(req.file.path);

  const product = await ProductRepository.create({
    image:  uploadResult.secure_url,
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
    const product = await ProductRepository.getAll({_id: req.params.id});
    const getPublicIdFromUrl = (url) =>{
      const urlParts = url.split("/")
      const publicIdWithExt = urlParts.splice(-2).join("/").split(".")[0]
      return publicIdWithExt
    }
    for(let x of product){
      const publicId = getPublicIdFromUrl(x.image)
      const result = await cloudinary.uploader.destroy(publicId);
    }
    await ProductRepository.deleteProduct({ _id: req.params.id });
    
  } catch {
    res.json({ message: "error" });
  }
}

//sửa sản phẩm
async function fixProduct(req, res, next) {
  try {
    const updateProduct = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      quantity: req.body.quantity,
      typeProductId: req.body.typeProductId,
      slug: slugify(req.body.name),
    };

    const getPublicIdFromUrl = (url) => {
      const urlParts = url.split("/");
      const publicIdWithExt = urlParts.slice(-2).join("/");
      const publicIdWithExtension = publicIdWithExt.split(".")[0];
      return publicIdWithExtension
    }

    if (req.file) {
      const product = await ProductRepository.getAll({ _id: req.params.id });
      for (let x of product) {
        imgpath = req.file.path
        const publicId = getPublicIdFromUrl(x.image)
        await cloudinary.uploader.destroy(publicId)
        const uploadResult = await cloudinary.uploader.upload(imgpath, {
          folder: 'products'
        })
        updateProduct.image = uploadResult.secure_url
        fs.unlinkSync(req.file.path);
      }
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

//lấy 10 sản phẩm mới nhất
async function newProduct(req, res, next) {
  const products = await ProductRepository.getNewProduct({isDeleted: null});
  const formatProducts = products.map((product) => {
    return {
      product,
      price: product.price.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    };
  });
  await res.json(formatProducts);
}

// lấy ra sản phẩm mang loai sản phẩm
async function getProductsNest(req, res, next) {
  const products = await ProductRepository.getAllWithJoin([{
    $lookup: {
      from: "typeproducs",
      localField: "typeProductId",
      foreignField: "_id",
      as: "typeProduct"
    }
  },{
    $match: {
      'typeProduct.slug': req.params.slug,
      isDeleted: null
    }
  }
]);
res.json(products)
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
  newProduct,
  getProductsNest
};
