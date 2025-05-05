const bill = require("../models/bill");

// lấy ra số năm doanh thu và lấy số lượng đơn hiện tại
const getYearRevenue = async (req, res) => {
  try {
    let year = new Date().getFullYear();
    const result = await bill.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createDate" },
          },
          totalRevenue: { $sum: "$Intomoney" },
          totalBill: { $sum: 1 },
        },
      },
      {
        $match: {
          "_id.year": year,
        },
      },
    ]);

    res.status(200).json({
      message: "Get monthly revenue successfully",
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
// lấy top 10 số lượng và doanh thu sản phẩm bán chạy nhất
const getTop10Product = async (req, res) => {
  try {
    const result = await bill.aggregate([
      {
        $unwind: "$products",
      },
      {
        $group: {
          _id: "$products._id",
          name: { $first: "$products.name" },
          totalRevenue: {
            $sum: {
              $multiply: ["$products.price", "$products.quantity"],
            },
          },
          totalQuantity: { $sum: "$products.quantity" },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: 10,
      }
    ]);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getYearRevenue, getTop10Product };
