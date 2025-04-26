const bill = require("../models/bill");

const handleWebhook = async (req, res) => {
  console.log("Received webhook:", req.body);
  const { data, error } = req.body;

  if (!error || !data) {
    return res.status(400).json({ code: 400, message: "Bad Request" });
  }

  const { description, amount } = data;

  const orderIdRegex = /\b[A-Z0-9]+\b/g; // hoặc regex theo quy tắc mã đơn hàng của bạn
  const matches = description.match(orderIdRegex);
  const extractedOrderId = matches ? matches[0] : null;
  console.log("extractedOrderId", extractedOrderId);

  if (!extractedOrderId) {
    return res
      .status(400)
      .json({ code: 400, message: "Cannot find order ID in description" });
  }

  // 🛑 Từ extractedOrderId → bạn cần truy vấn vào DB tìm thông tin đơn hàng
  const order = await bill.findOne({ _id: extractedOrderId }); // (giả sử bạn dùng MongoDB)

  if (!order) {
    return res.status(400).json({ code: 400, message: "Order not found" });
  }

  if (order.Intomoney !== amount) {
    return res.status(400).json({ code: 400, message: "Amount mismatch" });
  }

  console.log(
    "✅ Xác nhận thanh toán thành công cho đơn hàng:",
    extractedOrderId
  );

  return res.status(200).json({ code: 200, message: "OK" });
};

module.exports = {
  handleWebhook,
};
