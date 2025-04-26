const handleWebhook = async (req, res) => {
  console.log("Received webhook:", req.body);

  const { error, data } = req.body;

  if (error !== 0 || !data) {
    return res.status(400).json({ code: 400, message: "Bad Request" });
  }

  const { description, amount } = data;

  // Giả sử bạn cần kiểm tra orderId và số tiền khớp
  const expectedOrderId = req.body.orderId; // <- hoặc lấy từ db nếu đã lưu
  const expectedAmount = req.body.amountBill;    // <- hoặc từ db

  if (!expectedOrderId || !expectedAmount) {
    return res.status(400).json({ code: 400, message: "Missing expected values" });
  }

  if (description.includes(expectedOrderId) && amount == expectedAmount) {
    console.log("✅ Thanh toán hợp lệ cho đơn hàng:", expectedOrderId);
    return res.status(200).json({ code: 200, message: "OK" });
  } else {
    console.warn("⚠️ Sai orderId hoặc amount:", { description, amount });
    return res.status(400).json({ code: 400, message: "Order mismatch" });
  }
};

module.exports = {
  handleWebhook,
};
