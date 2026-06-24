const crypto = require("crypto");
const axios = require("axios");
const mongoose = require("mongoose");
const Product = require("../app/models/product");

const QUOTE_TTL_MS = 10 * 60 * 1000;
const MAX_ORDER_ITEMS = 50;
const MAX_ITEM_QUANTITY = 1000;
const MAX_ORDER_TOTAL = 1_000_000_000_000;

class OrderValidationError extends Error {
  constructor(message, status = 400, details) {
    super(message);
    this.name = "OrderValidationError";
    this.status = status;
    this.details = details;
  }
}

function normalizeCode(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePhone(value) {
  return typeof value === "string" ? value.replace(/\s+/g, "").trim() : "";
}

function normalizeOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderValidationError("Đơn hàng phải có ít nhất một sản phẩm.");
  }

  if (items.length > MAX_ORDER_ITEMS) {
    throw new OrderValidationError(
      `Đơn hàng không được vượt quá ${MAX_ORDER_ITEMS} sản phẩm.`
    );
  }

  const seenProductIds = new Set();

  return items.map((item) => {
    const productID = String(item?.productID || "").trim().toLowerCase();
    const quantity = Number(item?.quantity);

    if (!mongoose.Types.ObjectId.isValid(productID)) {
      throw new OrderValidationError("Mã sản phẩm không hợp lệ.");
    }

    if (seenProductIds.has(productID)) {
      throw new OrderValidationError("Sản phẩm bị lặp trong đơn hàng.");
    }
    seenProductIds.add(productID);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_ITEM_QUANTITY
    ) {
      throw new OrderValidationError(
        `Số lượng sản phẩm phải là số nguyên từ 1 đến ${MAX_ITEM_QUANTITY}.`
      );
    }

    return { productID, quantity };
  });
}

function createItemsFingerprint(items) {
  return [...items]
    .sort((first, second) => first.productID.localeCompare(second.productID))
    .map((item) => `${item.productID}:${item.quantity}`)
    .join("|");
}

async function priceOrderItems(items) {
  const normalizedItems = normalizeOrderItems(items);
  const products = [];
  const unavailableProducts = [];
  let subtotal = 0;

  for (const item of normalizedItems) {
    const product = await Product.getById(item.productID);

    if (!product || product.isDeleted === true) {
      unavailableProducts.push({
        productID: item.productID,
        reason: "Sản phẩm không tồn tại hoặc đã ngừng bán",
      });
      continue;
    }

    const stock = Number(product.quantity);
    if (!Number.isFinite(stock) || stock < item.quantity) {
      unavailableProducts.push({
        productID: item.productID,
        name: product.name,
        stock: Number.isFinite(stock) ? stock : 0,
        reason: `Chỉ còn ${Number.isFinite(stock) ? stock : 0} sản phẩm`,
      });
      continue;
    }

    const storedPrice = product.priceDiscount ?? product.price;
    const price = Number(storedPrice?.toString?.() ?? storedPrice);

    if (!Number.isFinite(price) || price < 0) {
      throw new OrderValidationError(
        `Giá của sản phẩm ${product.name || item.productID} không hợp lệ.`,
        500
      );
    }

    const lineTotal = price * item.quantity;
    subtotal += lineTotal;

    if (!Number.isSafeInteger(Math.round(subtotal)) || subtotal > MAX_ORDER_TOTAL) {
      throw new OrderValidationError("Tổng giá trị đơn hàng vượt giới hạn.");
    }

    products.push({
      productID: product._id.toString(),
      name: product.name,
      price,
      quantity: item.quantity,
      img: Array.isArray(product.image) ? product.image[0] || "" : "",
    });
  }

  if (unavailableProducts.length > 0) {
    throw new OrderValidationError(
      "Có sản phẩm không đủ số lượng trong kho.",
      409,
      unavailableProducts
    );
  }

  return {
    items: normalizedItems,
    products,
    subtotal: Math.round(subtotal),
  };
}

function extractDiscountPercentage(data) {
  const firstValue = Array.isArray(data?.value) ? data.value[0] : data?.value;
  const rawValue =
    data?.giatrimagiam ??
    data?.discount_value ??
    firstValue?.giatrimagiam ??
    firstValue?.discount_value ??
    (typeof firstValue === "number" || typeof firstValue === "string"
      ? firstValue
      : undefined);
  const percentage = Number(rawValue);

  if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
    throw new OrderValidationError("Mã giảm giá không hợp lệ.");
  }

  return percentage;
}

async function verifyDiscountCode(code, phoneNumber) {
  const normalizedCode = normalizeCode(code);
  const normalizedPhone = normalizePhone(phoneNumber);

  if (!normalizedCode) return 0;
  if (!normalizedPhone) {
    throw new OrderValidationError(
      "Cần số điện thoại để kiểm tra mã giảm giá."
    );
  }

  try {
    const response = await axios.post(
      "https://kocapi.io.vn/su-dung-ma-giam-gia",
      {
        tenmagiamgia: normalizedCode,
        phone: normalizedPhone,
      },
      { timeout: 10000 }
    );

    return extractDiscountPercentage(response.data);
  } catch (error) {
    if (error instanceof OrderValidationError) throw error;

    throw new OrderValidationError(
      error.response?.status === 422
        ? "Mã giảm giá đã được sử dụng hoặc không còn hiệu lực."
        : "Không thể kiểm tra mã giảm giá lúc này. Vui lòng thử lại.",
      error.response?.status === 422 ? 422 : 502
    );
  }
}

function calculateTotals(subtotal, discountPercentage = 0) {
  const percentage = Number(discountPercentage);

  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    throw new OrderValidationError("Giá trị giảm giá không hợp lệ.");
  }

  const discountAmount = Math.round((subtotal * percentage) / 100);
  const total = Math.max(0, subtotal - discountAmount);

  return { subtotal, discountPercentage: percentage, discountAmount, total };
}

function getQuoteSecret() {
  const secret = process.env.ORDER_QUOTE_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("ORDER_QUOTE_SECRET or JWT_SECRET is not configured");
  }
  return `${secret}:order-quote:v1`;
}

function signQuote({ items, code, phoneNumber, discountPercentage }) {
  const payload = {
    type: "order-quote",
    items: createItemsFingerprint(items),
    code: normalizeCode(code),
    phoneNumber: normalizePhone(phoneNumber),
    discountPercentage,
    expiresAt: Date.now() + QUOTE_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );
  const signature = crypto
    .createHmac("sha256", getQuoteSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

function verifyQuote(token, { items, code, phoneNumber }) {
  if (typeof token !== "string" || !token.includes(".")) {
    throw new OrderValidationError(
      "Thông tin mã giảm giá đã hết hạn. Vui lòng áp dụng lại mã."
    );
  }

  const [encodedPayload, receivedSignature] = token.split(".");
  const expectedSignature = crypto
    .createHmac("sha256", getQuoteSecret())
    .update(encodedPayload)
    .digest("base64url");
  const receivedBuffer = Buffer.from(receivedSignature || "");
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw new OrderValidationError("Thông tin giảm giá không hợp lệ.");
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString());
  } catch {
    throw new OrderValidationError("Thông tin giảm giá không hợp lệ.");
  }

  const quoteMatchesOrder =
    payload.type === "order-quote" &&
    payload.expiresAt >= Date.now() &&
    payload.items === createItemsFingerprint(items) &&
    payload.code === normalizeCode(code) &&
    payload.phoneNumber === normalizePhone(phoneNumber);

  if (!quoteMatchesOrder) {
    throw new OrderValidationError(
      "Giỏ hàng hoặc mã giảm giá đã thay đổi. Vui lòng áp dụng lại mã."
    );
  }

  const percentage = Number(payload.discountPercentage);
  if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
    throw new OrderValidationError("Thông tin giảm giá không hợp lệ.");
  }

  return percentage;
}

async function reserveStock(products) {
  const reservedProducts = [];

  try {
    for (const product of products) {
      const reserved = await Product.model.findOneAndUpdate(
        {
          _id: product.productID,
          quantity: { $gte: product.quantity },
          isDeleted: { $ne: true },
        },
        { $inc: { quantity: -product.quantity } },
        { new: true }
      );

      if (!reserved) {
        throw new OrderValidationError(
          `Sản phẩm ${product.name} vừa hết hàng hoặc không đủ số lượng.`,
          409,
          [{ productID: product.productID, name: product.name }]
        );
      }

      reservedProducts.push(product);
    }
  } catch (error) {
    await Promise.all(
      reservedProducts.map((product) =>
        Product.model.updateOne(
          { _id: product.productID },
          { $inc: { quantity: product.quantity } }
        )
      )
    );
    throw error;
  }

  return async function rollbackStock() {
    await Promise.all(
      reservedProducts.map((product) =>
        Product.model.updateOne(
          { _id: product.productID },
          { $inc: { quantity: product.quantity } }
        )
      )
    );
  };
}

module.exports = {
  OrderValidationError,
  calculateTotals,
  normalizeCode,
  normalizePhone,
  normalizeOrderItems,
  priceOrderItems,
  reserveStock,
  signQuote,
  verifyDiscountCode,
  verifyQuote,
};
