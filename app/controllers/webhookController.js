
const handleWebhook = async (req, res) => {
  console.log("Received webhook:", req.body);
  if(!req.body.orderId || !req.body.amount) {
    return res.status(400).json({ code: 400, message: "Bad Request" });
  }
  if (req.body.description.includes(req.body.orderId ) && req.body.amount === req.body.amountBill) {
    res.status(200).json({ code: 200, message: "OK" });
  }
};

module.exports = {
  handleWebhook,
};
