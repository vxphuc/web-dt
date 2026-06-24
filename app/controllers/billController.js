const billModel = require("../models/bill");
const Product = require("../models/product");
const user = require("../models/user");
const { default: axios } = require("axios");
const logger = require("../../config/logger");
const ProductRepository = require("../models/product");
const {
  OrderValidationError,
  calculateTotals,
  normalizeCode,
  normalizePhone,
  priceOrderItems,
  reserveStock,
  signQuote,
  verifyDiscountCode,
  verifyQuote,
} = require("../../services/orderService");

const ALLOWED_PAYMENT_FORMS = new Set([
  "Tiền mặt khi nhận hàng",
  "Thanh toán bằng tiền mặt",
  "Thanh toán qua ngân hàng",
]);

function readText(value, fieldName, maxLength, required = true) {
  const text = typeof value === "string" ? value.trim() : "";
  if (required && !text) {
    throw new OrderValidationError(`${fieldName} là bắt buộc.`);
  }
  if (text.length > maxLength) {
    throw new OrderValidationError(
      `${fieldName} không được vượt quá ${maxLength} ký tự.`
    );
  }
  return text;
}

function sanitizeCustomerInformation(body) {
  const phoneNumber = normalizePhone(body.phoneNumber);
  if (!/^(0[35789]\d{8}|84[35789]\d{8})$/.test(phoneNumber)) {
    throw new OrderValidationError("Số điện thoại không hợp lệ.");
  }

  const alternateReceiverName = readText(
    body.alternateReceiverName,
    "Tên người nhận hộ",
    100,
    false
  );
  const alternateReceiverPhone = normalizePhone(body.alternateReceiverPhone);

  if (
    alternateReceiverPhone &&
    !/^(0[35789]\d{8}|84[35789]\d{8})$/.test(alternateReceiverPhone)
  ) {
    throw new OrderValidationError("Số điện thoại người nhận hộ không hợp lệ.");
  }
  if (
    (alternateReceiverName && !alternateReceiverPhone) ||
    (!alternateReceiverName && alternateReceiverPhone)
  ) {
    throw new OrderValidationError(
      "Cần nhập đủ tên và số điện thoại người nhận hộ."
    );
  }

  const requestedPaymentForm = readText(
    body.PaymentForm,
    "Phương thức thanh toán",
    100,
    false
  );
  const PaymentForm = requestedPaymentForm || "Tiền mặt khi nhận hàng";
  if (!ALLOWED_PAYMENT_FORMS.has(PaymentForm)) {
    throw new OrderValidationError("Phương thức thanh toán không hợp lệ.");
  }

  return {
    UserName: readText(body.UserName, "Tên người nhận", 100),
    phoneNumber,
    province: readText(body.province, "Tỉnh/thành phố", 100),
    ward: readText(body.ward, "Phường/xã", 100),
    road: readText(body.road, "Địa chỉ", 300),
    alternateReceiverName,
    alternateReceiverPhone,
    PaymentForm,
  };
}

const getPhoneVariants = (phone) => {
  if (!phone) return [];
  const normalized = String(phone).trim();
  const variants = new Set([normalized]);

  if (normalized.startsWith("84")) {
    variants.add(`0${normalized.slice(2)}`);
  } else if (normalized.startsWith("0")) {
    variants.add(`84${normalized.slice(1)}`);
  }

  return Array.from(variants);
};

const isOrderStaff = (requestUser) =>
  requestUser && ["admin", "editor"].includes(requestUser.role);

const canAccessBill = (requestUser, bill) => {
  if (isOrderStaff(requestUser)) return true;
  return getPhoneVariants(requestUser?.numberPhone).includes(bill.phoneNumber);
};

async function quoteBill(req, res) {
  try {
    const pricedOrder = await priceOrderItems(req.body.products);
    const code = normalizeCode(req.body.code);
    const phoneNumber = normalizePhone(req.body.phoneNumber);
    const discountPercentage = code
      ? await verifyDiscountCode(code, phoneNumber)
      : 0;
    const totals = calculateTotals(
      pricedOrder.subtotal,
      discountPercentage
    );
    const quoteToken = code
      ? signQuote({
          items: pricedOrder.items,
          code,
          phoneNumber,
          discountPercentage,
        })
      : null;

    return res.status(200).json({
      ...totals,
      quoteToken,
      products: pricedOrder.products,
    });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return res.status(error.status).json({
        message: error.message,
        products: error.details,
      });
    }
    logger.error(`billController: quoteBill = err ${error}`);
    return res.status(500).json({ message: "Lỗi server" });
  }
}

// Tạo đơn hàng. Giá và tổng tiền luôn được tính lại từ database.
async function createBill(req, res) {
  let rollbackStock;

  try {
    logger.info("Nhận yêu cầu tạo đơn hàng");
    const customer = sanitizeCustomerInformation(req.body);
    const pricedOrder = await priceOrderItems(req.body.products);
    const code = normalizeCode(req.body.code);
    const discountPercentage = code
      ? verifyQuote(req.body.quoteToken, {
          items: pricedOrder.items,
          code,
          phoneNumber: customer.phoneNumber,
        })
      : 0;
    const totals = calculateTotals(
      pricedOrder.subtotal,
      discountPercentage
    );

    rollbackStock = await reserveStock(pricedOrder.products);

    const bill = await billModel.create({
      ...customer,
      products: pricedOrder.products,
      Intomoney: totals.total,
      magiamgia: code || undefined,
      app: "web",
    });
    rollbackStock = null;

    if (code) {
      try {
        await axios.post(
          "https://kocapi.io.vn/luu-don-hang-va-san-pham-trong-don",
          {
            madonhang: bill._id.toString(),
            province: bill.province,
            ward: bill.ward,
            road: bill.road,
            tennguoidat: bill.UserName,
            sotiensaukhidungma: totals.total,
            maduocsudung: code,
            sotientruockhisudungma: totals.subtotal,
            sanpham: bill.products.map((p) => ({
              name: p.name,
              quantity: Number(p.quantity),
              price: Number(p.price?.toString?.() ?? p.price ?? 0),
            })),
            sodienthoainguoidat: bill.phoneNumber,
          },
          { timeout: 10000 }
        );
      } catch (error) {
        logger.error(`Không thể đồng bộ đơn hàng với KOC API: ${error}`);
      }
    }

    return res.status(201).json(bill);
  } catch (error) {
    if (rollbackStock) {
      try {
        await rollbackStock();
      } catch (rollbackError) {
        logger.error(`Không thể hoàn lại tồn kho: ${rollbackError}`);
      }
    }

    if (error instanceof OrderValidationError) {
      return res.status(error.status).json({
        message: error.message,
        products: error.details,
      });
    }
    logger.error(`billController: createBill = err ${error}`);
    return res.status(500).json({ message: "Lỗi server" });
  }
}

//lấy hóa đơn theo người dùng
const getBillByUser = async (req, res) => {
  const phoneVariants = getPhoneVariants(req.user.numberPhone);
  try {
    const bill = await billModel
      .find({ phoneNumber: { $in: phoneVariants } })
      .sort({ createDate: -1 });
    res.json(bill);
  } catch (error) {
    logger.error(`billController: getBillByUser = err ${error}`);
    res.status(500).json({ message: error });
  }
};

//lấy hóa đơn theo mã hóa đơn xem chi tiết hóa đơn
const getBillByCode = async (req, res) => {
  try {
    const bill = await billModel.findById(req.params.id);
    if (!bill)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    if (!canAccessBill(req.user, bill)) {
      return res.status(403).json({ message: "Bạn không có quyền xem đơn hàng này" });
    }

    res.json({ bill, user: { numberPhone: bill.phoneNumber } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//sửa trạng thái giao dịch
const updateBillStatus = async (req, res) => {
  try {
    const bill = await billModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          statusPay: "đã thanh toán",
          PaymentForm: "Thanh toán qua ngân hàng",
        },
      },
      { new: true }
    );
    if (!bill) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json(bill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// xem tất cả hóa đơn
const getAllBill = async (req, res) => {
  let status = req.query.status || "chờ xác nhận";
  try {
    const bill = await billModel.find({ OrderStatus: status });
    res.json(bill);
  } catch (error) {
    console.error(error);
  }
};

// sửa trạng thái giao dịch
const updateStatus = async (req, res) => {
  try {
    const allowedStatuses = new Set([
      "chờ xác nhận",
      "đã xác nhận",
      "đã giao hàng",
      "đang giao hàng",
      "hủy đơn hàng",
    ]);
    if (!allowedStatuses.has(req.body.OrderStatus)) {
      return res.status(400).json({ message: "Trạng thái đơn hàng không hợp lệ" });
    }

    const bill = await billModel.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    if (
      bill.OrderStatus === "hủy đơn hàng" &&
      req.body.OrderStatus !== "hủy đơn hàng"
    ) {
      return res.status(409).json({
        message: "Không thể mở lại đơn đã hủy vì tồn kho đã được hoàn lại",
      });
    }
    if (req.body.OrderStatus === "đã giao hàng") {
      // sửa logic cộng điểm
      const point = Math.floor(bill.Intomoney / 10000) * 0;
      await user.updateOne({ uid: bill.UserUID }, { $inc: { token: point } });
    }

    const updatedBill = await billModel.findOneAndUpdate(
      { _id: req.params.id, OrderStatus: bill.OrderStatus },
      { $set: { OrderStatus: req.body.OrderStatus } },
      { new: true, runValidators: true }
    );
    if (!updatedBill) {
      return res.status(409).json({
        message: "Trạng thái đơn vừa được thay đổi. Vui lòng tải lại.",
      });
    }

    if (
      bill.OrderStatus !== "hủy đơn hàng" &&
      req.body.OrderStatus === "hủy đơn hàng"
    ) {
      await Promise.all(
        bill.products.map((product) =>
          Product.model.updateOne(
            { _id: product.productID },
            { $inc: { quantity: product.quantity } }
          )
        )
      );
    }
    res.json(updatedBill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// hủy đơn hàng
const cancelOrder = async (req, res) => {
  try {
    const currentBill = await billModel.findById(req.params.id);
    if (!currentBill) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    if (!canAccessBill(req.user, currentBill)) {
      return res.status(403).json({ message: "Bạn không có quyền hủy đơn hàng này" });
    }
    const cancelledBill = await billModel.findOneAndUpdate(
      { _id: req.params.id, OrderStatus: "chờ xác nhận" },
      { $set: { OrderStatus: "hủy đơn hàng" } },
      { new: true, runValidators: true }
    );
    if (!cancelledBill) {
      return res.status(409).json({ message: "Đơn hàng không còn có thể hủy" });
    }

    await Promise.all(
      cancelledBill.products.map((product) =>
        Product.model.updateOne(
          { _id: product.productID },
          { $inc: { quantity: product.quantity } }
        )
      )
    );

    res.status(200).json({ message: "Hủy đơn hàng thành công", bill: cancelledBill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// lấy hóa đơn theo người dùng và trạng thái
const getBillByUserAndStatus = async (req, res) => {
  const phoneVariants = getPhoneVariants(req.user.numberPhone);
  try {
    const bill = await billModel
      .find({ phoneNumber: { $in: phoneVariants } })
      .sort({ createDate: -1 });
    res.json(bill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
};

// sự kiện đổi quà
const doiqua = async (req, res) => {
  try {
    const {
      magiamgia,
      madonhang,
      province,
      ward,
      road,
      UserName,
      phoneNumber,
    } = req.body;

    let ktrma;
    try {
      ktrma = await axios.post("https://kocapi.io.vn/kiem-tra-ma-hop-le", {
        magiamgia,
      });
    } catch (err) {
      if (err.response && err.response.status === 400) {
        return res.status(400).json("mã không hợp lệ");
      }
      return res.status(500).json("lỗi kiểm tra mã giảm giá");
    }

    if (madonhang != "6954c48b3f84f2fd3ec4bb68") {
      return res.status(400).json("sản phẩm không hợp lệ");
    }

    const sanpham = await ProductRepository.getAll({
      _id: "6954c48b3f84f2fd3ec4bb68",
    });
    const sanpham1 = sanpham.map((sp) => {
      return {
        name: sp.name,
        price: sp.price,
        quantity: 1,
        img: sp.img?.[0],
        productID: sp.typeProductId,
      };
    });

    const bill = await billModel.create({
      magiamgia: magiamgia,
      products: sanpham1,
      Intomoney: 0,
      province,
      ward,
      road,
      UserName,
      phoneNumber,
    });

    return res.status(200).json({ message: "tạo thành công" });
    
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

module.exports = {
  quoteBill,
  createBill,
  getBillByUser,
  getBillByCode,
  updateBillStatus,
  getAllBill,
  updateStatus,
  cancelOrder,
  getBillByUserAndStatus,
  doiqua,
};
