const cartsModel = require("../models/carts");

const index = async (req, res) => {
  try {
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
    ]);
    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const existingCart  = await cartsModel.findOne({productID: req.body.productID});
    if (existingCart ) {
      existingCart .quantity += 1;
      const savedCarts = await existingCart.save();
      return res.status(200).json(savedCarts);
    }

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

const Delete = async (req, res) => {
  try {
    const cart = await cartsModel.deleteMany({ productID: req.params.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json({ message: "Cart deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateincrease = async (req, res) => {
  try {
    const cart = await cartsModel.updateOne(
      { productID: req.params.id, userID: req.user.uid },
      { $inc: { quantity: 1 } }
    );
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDecrease = async (req, res) => {
  try {
    const cart = await cartsModel.findOne({
      productID: req.params.id,
      userID: req.user.uid,
    });
    if(cart.quantity === 1){
      await cartsModel.deleteOne({productID: req.params.id, userID: req.user.uid});
      return res.json({message: "Xóa thành công"})
    }
    if(cart.quantity > 1){
      const updateCart = await cartsModel.updateOne(
        { productID: req.params.id, userID: req.user.uid },
        { $inc: { quantity: -1 } }
      );
      res.json(updateCart);
    }
  }catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  index,
  create,
  Delete,
  updateincrease,
  updateDecrease,
};
