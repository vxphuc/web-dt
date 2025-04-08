const cartsModel = require("../models/carts");

const index = async (req, res) => {
  try {
    console.log(req.user.uid);
    const carts = await cartsModel.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productID",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $match: {
          userID: req.user.uid,
        },
      },
      {
        $group: {
            _id: "$productID",
            product: { $first: "$product" },
            quantity: { $sum: 1 },
        }
      }
    ]);
    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const cart = new cartsModel({
      productID: req.body.productID,
      userID: req.user.uid,
    });
    const savedCarts = await cart.save();
    res.status(201).json(savedCarts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  index,
  create,
  // show,
  // update,
  // delete
};
