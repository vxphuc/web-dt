

const handleWebhook = async (req, res) => {

  console.log("Received webhook:", req.body);
  res.status(200).json({ code: 200, message: "OK" });
};

module.exports = {
  handleWebhook,
};
