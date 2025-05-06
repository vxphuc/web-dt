const bill = require("../models/bill");
const moment = require("moment");

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
        $sort: { totalQuantity: -1 },
      },
      {
        $limit: 10,
      },
    ]);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// lấy doanh thu theo các tuần hiện tại
const getWeekRevenue = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const d = new Date();
    let month = d.getMonth() + 1;
    const weeklyRevenue = await bill.aggregate([
      {
        $group: {
          _id: {
            week: { $week: "$createDate" },
            month: { $month: "$createDate" },
          },
          totalRevenue: { $sum: "$Intomoney" },
        },
      },
      {
        $match: {
          "_id.month": month,
        },
      },
      {
        $sort: { "_id.week": 1 },
      },
    ]);
    res
      .status(200)
      .json({ message: "Get weekly revenue successfully", weeklyRevenue });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// lấy doanh thu theo ngày tính ra thứ trong tuần hiện tại
const getDayRevenue = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const d = new Date();
    let month = d.getMonth() + 1;
    const isoWeekNow = moment(d).isoWeek();
    const dailyRevenue = await bill.aggregate([
      {
        $addFields: {
          createDateAsDate: {
            $toDate: "$createDate",
          },
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: [
                  {
                    $month: "$createDateAsDate",
                  },
                  month,
                ],
              },
              {
                $eq: [
                  {
                    $year: "$createDateAsDate",
                  },
                  currentYear,
                ],
              },
              {
                $eq: [
                  {
                    $isoWeek: "$createDateAsDate",
                  },
                  isoWeekNow,
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            week: { $isoWeek: "$createDateAsDate" },
            dayOfWeek: { $dayOfWeek: "$createDateAsDate" },
            year: { $year: "$createDateAsDate" },
            month: { $month: "$createDateAsDate" },
          },
          totalRevenue: { $sum: "$Intomoney" },
        },
      },
      {
        $sort: {
          "_id.week": -1,
          "_id.dayOfWeek": 1,
        },
      },
    ]);
    res.status(200).json({
      message: "Get daily revenue successfully",
      dailyRevenue,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getYearRevenue,
  getTop10Product,
  getWeekRevenue,
  getDayRevenue,
};
