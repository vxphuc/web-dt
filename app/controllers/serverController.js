const axios = require("axios");
require("dotenv").config();

let paymentCache = {};

async function casso(req, res) {
  const API_CASSO_Getpage = process.env.API_CASSO_Getpage;

  try {
    const { orderId, amount } = req.body;
    if (!orderId || !amount) {
      return res.status(400).json({ message: "Thiếu orderId hoặc amount" });
    }

    if (paymentCache[orderId]) {
      return res.json({ paid: true });
    }

    const response = await axios.get(API_CASSO_Getpage, {
      headers: {
        Authorization: `apikey ${process.env.API_CASSO}`,
        "Content-Type": "application/json",
      },
    });

    const records = response.data.data?.records || [];
    const cleanAmount = parseInt(amount.replace(/[^\d]/g, ""), 10);

    const matched = records.find((txn) => {
      const desc = txn.description?.toLowerCase() || "";
      const isMatchId = desc.includes(orderId.toLowerCase());
      const isMatchAmount = parseInt(txn.amount) === cleanAmount;

      return isMatchId && isMatchAmount;
    });

    if (matched) {
      paymentCache[orderId] = true;
      console.log(`✅ Thanh toán hợp lệ cho đơn hàng ${orderId}`);

      setTimeout(() => {
        delete paymentCache[orderId];
      }, 10 * 60 * 1000); // 10 phút xoá cache

      return res.json({ paid: true });
    } else {
      return res.json({ paid: false });
    }

  } catch (err) {
    console.error("Lỗi khi gọi Casso:", err.message);
    res
      .status(err.response?.status || 500)
      .json({ message: "Lỗi khi gọi Casso" });
  }
}

module.exports = { casso };
