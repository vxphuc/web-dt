const Review = require("../models/reviewForm");

//xem bình luận và đánh giá sản phẩm
const getReviewForm = async (req, res, next) => {
  const review = await Review.find({productID: req.params.id})
  res.json(review)
};

// đánh giá sản phẩm
const createReview = async (req, res, next) => {
  try {

    const createReview = new Review( req.body );
    await createReview.save();
    res.status(201).json({ message: "Đánh giá thành công" });
  } catch(err) {
    console.error("Lỗi khi tạo đánh giá:", err);
    res.status(400).json({ message: "Lỗi khi gửi đánh giá", error: err.message });
  }
};

module.exports = { getReviewForm, createReview }; 
