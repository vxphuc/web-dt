const { default: webhookUtil } = require("../../utils/casso/webhook.util");
const syncUtil = require("../../utils/casso/sync.util");
const bank = require("../models/bank");
const bill = require("../models/bill");
require("dotenv").config();

const secure_token = process.env.CASSO_SECURE_TOKEN
const expiration_date = 1;
const transaction_prefix = 'CASSO';
const case_insensitive = false;
const api_key = process.env.API_KEY_CASSO;

const handleWebhook = async (req, res) => {
  try {
    // B1: Ở đây mình sẽ thực hiện check secure-token. Bình thường phần này sẽ nằm trong middlewares
    // Mình sẽ code trực tiếp tại đây cho dễ hình dung luồng. Nếu không có secure-token hoặc sai đều trả về lỗi
    if (
      !req.header("secure-token") ||
      req.header("secure-token") != secure_token
    ) {
      return res.status(401).json({
        code: 401,
        message: "Missing secure-token or wrong secure-token",
      });
    }
    // B2: Thực hiện lấy thông tin giao dịch
    for (let item of req.body.data) {
      // Lấy thông orderId từ nội dung giao dịch
      let orderId = webhookUtil.parseOrderId(
        case_insensitive,
        transaction_prefix,
        item.description
      );
      // Nếu không có orderId phù hợp từ nội dung ra next giao dịch tiếp theo
      if (!orderId) continue;
      // Kiểm tra giao dịch còn hạn hay không? Nếu không qua giao dịch tiếp theo
      if (
        (new Date().getTime() - new Date(item.when).getTime()) / 86400000 >=
        expiration_date
      )
        continue;
      // Bước quan trọng đây.
      // Sau khi có orderId Thì thực hiện thay đổi các trang thái giao dịch
      // Ví dụ như kiểm tra orderId có tồn tại trong danh sách các đơn hàng của bạn?
      // Sau đó cập nhật trạng thái theo orderId và amount nhận được: đủ hay thiếu tiền...
      // Và một số chức năng khác có thể tùy biến
    }
    return res.status(200).json({
      code: 200,
      message: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const handlecheck = async (req, res) => {
  try {
    const { id } = req.body;
    const bankData = await bank.findOne({ orderId: id });
    if (!bankData) {
      console.log("Bank data not found for id:", id);
      return res.status(404).json({ code: 404, message: "Not Found" });
    }
    return res.status(200).json({ code: 200, message: "OK", data: bankData });
  } catch (error) {
    console.error("Error handling check:", error);
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error" });
  }
};

const usersPaid = async (req, res, next) => {
  try {
    // Để thực hiện tính năng đồng bộ cần có Số tài khoản, Bạn có thể validate bằng schema ở middlewares
    // Hoặc có thể kiểm tra trong đây luôn
    console.log('BODY:', req.body);
    if (!req.body.accountNumber) {
      return res.status(404).json({
        code: 404,
        message: "Not foung Account number",
      });
    }

    await syncUtil.syncTransaction(req.body.accountNumber);
    return res.status(200).json({
      code: 200,
      message: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const registerWebhook = async (req, res, next) => {
  try {
    //Delete Toàn bộ webhook đã đăng kí trước đó với https://ten-mien-cua-ban.com/webhook/handler-bank-transfer
    await webhookUtil.deleteWebhookByUrl(
      "https://sieuthidt.com/webhook/handler-bank-transfer"
    );
    //Tiến hành tạo webhook
    let data = {
      webhook: "https://sieuthidt.com/webhook/handler-bank-transfer",
      secure_token: secure_token,
      income_only: true,
    };
    let newWebhook = await webhookUtil.create(data);
    // Lấy thông tin về userInfo
    let userInfo = await userUtil.getDetailUser();
    return res.status(200).json({
      code: 200,
      message: "success",
      data: {
        webhook: newWebhook.data,
        userInfo: userInfo.data,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleWebhook,
  handlecheck,
  usersPaid,
  registerWebhook,
};
