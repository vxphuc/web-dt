const ProductRepository = require("../models/product");
const fs = require("fs");
const slugify = require("slugify");
const cloudinary = require("../../config/cloudinaryConfig");

//Get product not delete
async function index(req, res, next) {
  const page = Number.parseInt(req.query.page) || 1;
  const limit = Number.parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [products, deleteCount, totalCount] = await Promise.all([
    ProductRepository.getAllWithJoin(
      [
        { $match: { isDeleted: null } },
        {
          $lookup: {
            from: "typeproducs",
            localField: "typeProductId",
            foreignField: "_id",
            as: "typeProduct",
          },
        },
      ],
      limit,
      skip
    ),
    ProductRepository.countProduct({ isDeleted: true }),
    ProductRepository.countProduct({ isDeleted: null }), 
  ]);
  const formattedProducts = products.map((product) => ({
    ...product,
    price: product.price.toString(),
  }));

  res.json({
    results: formattedProducts,
    count: deleteCount,
    totalCount: totalCount,
    totalPages: Math.ceil(totalCount / limit), 
    currentPage: page,
  });
}

//create post
async function create(req, res, next) {
  const imageeName = req.files;
  const imageUrls = [];
  if(imageeName){
    for (let i = 0; i < imageeName.length; i++) {
    const uploadResult = await cloudinary.uploader.upload(imageeName[i].path, {
      folder: "products",
    });
    imageUrls.push(uploadResult.secure_url);
    fs.unlinkSync(imageeName[i].path);
  }
  }
  const discount = req.body.discount
  const price = req.body.price
  if(discount < 0) {
    return res.status(400).json({ message: "Discount cannot be less than 0"})
  }

  const priceDiscount = price - (price * discount / 100)
  const product = await ProductRepository.create({
    image: imageUrls,
    priceDiscount: priceDiscount,
    ...req.body,
  });
  res.json(product);
}

//Patch destroy soft-delete
function destroy(req, res, next) {
  const product = ProductRepository.updateoneFiled(
    { _id: req.params.id },
    { $set: { isDeleted: true, deletedAt: new Date() } }
  );
  res.json(product);
}

//Get product delete
async function RecycleBin(req, res, next) {
  const productDelete = await ProductRepository.getAllWithJoin(
    [
      { $match: { isDeleted: true } },
      {
        $lookup: {
          from: "typeproducs",
          localField: "typeProductId",
          foreignField: "_id",
          as: "typeProduct",
        },
      },
    ],
    10
  );
  const products = await productDelete.map((product) => {
    return {
      ...product,
      price: product.price.toString(),
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
    const product = await ProductRepository.getAll({ _id: req.params.id });
    const getPublicIdFromUrl = (url) => {
      const urlParts = url.split("/");
      const publicIdWithExt = urlParts.slice(-2).join("/");
      const publicID = publicIdWithExt.split(".")[0];
      return publicID;
    };
    for (let x of product) {
      for (let i = 0; i < x.image.length; i++) {
        const publicId = getPublicIdFromUrl(x.image[i]);
        await cloudinary.uploader.destroy(publicId);
      }
    }
    const deleteProduct = await ProductRepository.deleteProduct({
      _id: req.params.id,
    });
    res.json(deleteProduct);
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
      discount: req.body.discount,
      slug: slugify(req.body.name),
      priceDiscount: req.body.price - (req.body.price * req.body.discount / 100),
    };

    const getPublicIdFromUrl = (url) => {
      const urlParts = url.split("/");
      const publicIdWithExt = urlParts.slice(-2).join("/");
      const publicIdWithExtension = publicIdWithExt.split(".")[0];
      return publicIdWithExtension;
    };

    if (req.file) {
      const product = await ProductRepository.getAll({ _id: req.params.id });
      for (let x of product) {
        imgpath = req.file.path;
        const publicId = getPublicIdFromUrl(x.image);
        await cloudinary.uploader.destroy(publicId);
        const uploadResult = await cloudinary.uploader.upload(imgpath, {
          folder: "products",
        });
        updateProduct.image = uploadResult.secure_url;
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
  const products = await ProductRepository.getAllWithJoin(
    [
      { $match: { slug: req.params.slug } },
      {
        $lookup: {
          from: "typeproducs", // Tên collection cần join
          localField: "typeProductId", // Trường trong collection hiện tại
          foreignField: "_id", // Trường trong collection khác
          as: "Typeproduct", // Tên mảng chứa dữ liệu trả về từ join
        },
      },
    ],
    1
  );
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
  const product = await ProductRepository.getAllWithJoin(
    [
      {
        $lookup: {
          from: "typeproducs",
          localField: "typeProductId",
          foreignField: "_id",
          as: "typeProduct",
        },
      },
      {
        $match: {
          isDeleted: null,
        },
      },
    ],
    10
  );
  res.json(product);
}

// lấy ra sản phẩm mang loai sản phẩm
async function getProductsNest(req, res, next) {
  let num = 20;
  const products = await ProductRepository.getAllWithJoin(
    [
      {
        $lookup: {
          from: "typeproducs",
          localField: "typeProductId",
          foreignField: "_id",
          as: "typeProduct",
        },
      },
      {
        $match: {
          "typeProduct.slug": req.params.slug,
          isDeleted: null,
        },
      },
    ],
    num
  );
  res.json(products);
}

// lấy ra sản phẩm mang loai sản phẩm
async function getProducts(req, res, next) {
  let num = req.query.num ? parseInt(req.query.num) : 20; // Số lượng sản phẩm mỗi trang
  let skip = 0;
  let filter = req.query.filter
  const products = await ProductRepository.getAllWithJoin(
    [
      {
        $lookup: {
          from: "typeproducs",
          localField: "typeProductId",
          foreignField: "_id",
          as: "typeProduct",
        },
      },
      {
        $match: {
          "typeProduct.slug": req.params.slug,
          isDeleted: null,
        },
      },
    ],
    num,
    skip,
    filter
  );
  res.json(products);
}

//xem tất cả các sản phẩm chưa bị xóa
async function getAllProducts(req, res, next) {
  const product = await ProductRepository.getWithJoin([
    {
      $lookup: {
        from: "typeproducs",
        localField: "typeProductId",
        foreignField: "_id",
        as: "typeProduct",
      },
    },
    {
      $match: {
        isDeleted: null,
      },
    },
  ]);
  res.json(product);
}

//tìm kiếm sản phẩm
const search = async (req, res, next) => {
  try {
    const { q } = req.query;
    const products = await ProductRepository.getAllWithJoin([
      {
        $lookup: {
          from: "typeproducs",
          localField: "typeProductId",
          foreignField: "_id",
          as: "typeProduct",
        },
      },{
        $match: {
          name: { $regex: q, $options: "i" }, // Tìm gần đúng không phân biệt hoa thường
          isDeleted: null
        },
      }
    ]);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllProducts,
  index,
  create,
  destroy,
  RecycleBin,
  Restore,
  Delete,
  fixProduct,
  show,
  newProduct,
  getProductsNest,
  getProducts,
  search,
};
