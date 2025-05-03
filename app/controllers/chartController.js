const bill = require("../models/bill");

const getMonthlyRevenue = async (req, res) => {
  try {
    const result = await bill.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createDate" },
            month: { $month: "$createDate" },
          },
          totalRevenue: { $sum: "$Intomoney" },
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

module.exports = { getMonthlyRevenue };
