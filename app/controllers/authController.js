const User = require("../models/user"); //model
const Banner = require("../models/banner");
const fs = require("fs");
const path = require("path");
const Notification = require("../models/Notification");
const axios = require("axios");
const request = require("request");
const { createOtp, verifyOtp } = require("../../services/otpService");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { getRedisClient } = require("../../config/redis");
const qs = require("qs");
const refresh_token = require("../models/refresh_token_zalo");
const { createHmac } = require("crypto");
const logger = require("../../config/logger");

let refreshTokenPromise = null;

async function getZaloAccessToken() {
  const tokenDoc = await refresh_token.findOne({ name: "zalo_token" });
  if (!tokenDoc?.token) {
    throw new Error("Missing zalo refresh token in database");
  }

  const now = Date.now();
  const expiresAt = tokenDoc.accessTokenExpiresAt
    ? new Date(tokenDoc.accessTokenExpiresAt).getTime()
    : 0;

  if (tokenDoc.accessToken && expiresAt - now > 30 * 1000) {
    return tokenDoc.accessToken;
  }

  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    const latestTokenDoc = await refresh_token.findOne({ name: "zalo_token" });
    if (!latestTokenDoc?.token) {
      throw new Error("Missing latest zalo refresh token in database");
    }

    const refreshed = await axios.post(
      "https://oauth.zaloapp.com/v4/oa/access_token",
      qs.stringify({
        app_id: "1240211320870133371",
        refresh_token: latestTokenDoc.token,
        grant_type: "refresh_token",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          secret_key: process.env.ZALO_SECRET,
        },
      },
    );

    const expiresIn = Number(refreshed.data.expires_in || 3600);
    const accessTokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    await refresh_token.updateOne(
      { name: "zalo_token" },
      {
        token: refreshed.data.refresh_token,
        accessToken: refreshed.data.access_token,
        accessTokenExpiresAt,
      },
    );

    return refreshed.data.access_token;
  })();

  try {
    return await refreshTokenPromise;
  } finally {
    refreshTokenPromise = null;
  }
}

// gửi phần thưởng qua tin nhắn
async function guiphanthuongvetinnhan(req, res, next) {
  try {
    const thongtin = req.body;
    const tokenZNS = await getZaloAccessToken();

    const response = await axios.post(
      "https://business.openapi.zalo.me/message/template",
      {
        phone: thongtin.numberphone,
        template_id: process.env.ZNS_SUKIEN,
        template_data: {
          ngay_mua_hang: "01/08/2020",
          code: thongtin.code,
          giai_thuong: thongtin.giathuong,
          ngay_ket_thuc: "03/05/2025",
          payment_status: "đổi mã thành công",
          customer_name: thongtin.numberphone,
          ngay_bat_dau: "03/03/2025",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          access_token: tokenZNS,
        },
        timeout: 10000,
      },
    );

    return res.json({
      message: "Gửi ZNS thành công",
      zalo_response: response.data,
    });
  } catch (error) {
    console.error("ZNS error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Gửi ZNS thất bại",
      error: error.response?.data || error.message,
    });
  }
}

// taọ banener
async function uploadBaner(req, res, next) {
  const banner = await new Banner({
    image: req.file.filename,
  });
  banner.save();
  await res.json(banner);
}

//lấy ra tất cả banner để hiển thị
async function GetBanner(req, res, next) {
  try {
    const banner = await Banner.find();
    const times = banner.map((time) => {
      return {
        id: time._id,
        dateCreate: time.dateCreate.toLocaleString("vi-VI"),
        image: time.image,
      };
    });
    await res.json(times);
  } catch {
    return res.status(500).json({ message: "Lỗi server" });
  }
}

//xóa banner
async function deleteBanner(req, res, next) {
  try {
    const banner = await Banner.find({ _id: req.params.id });
    banner.map((img) => {
      link = path.join(__dirname, "..", "..", "public", "uploads", img.image);
      fs.unlink(link, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("file deleted");
        }
      });
    });
    Banner.deleteOne({ _id: req.params.id })
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  } catch (err) {
    return res.json("lỗi khi xóa");
  }
}

// POST gửi otp
async function createOTP(req, res, next) {
  try {
    const accessToken = await getZaloAccessToken();
    const { numberPhone } = req.body;
    const phoneslice = `84${numberPhone.slice(1)}`;
    // const otp = await createOtp(numberPhone);
    const otp = await axios.post(
      `https://chatapi.io.vn/tao-otp?numberPhone=${numberPhone}`,
    );
    const zaloRes = await axios.post(
      "https://business.openapi.zalo.me/message/template",
      {
        phone: phoneslice,
        template_id: process.env.ZALOPAY_OTP,
        template_data: {
          otp: otp.data,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          access_token: accessToken,
        },
      },
    );
    res.status(200).json({
      message: "OTP sent successfully",
      numberPhone,
      data: zaloRes.data,
    });
  } catch (err) {
    logger.error(`authController.createOTP ${err}`);
    return res.status(500).json(err);
  }
}

//POST create and login
async function signin(req, res, next) {
  const { numberPhone, otp } = req.body;
  try {
    const phoneslice = `84${numberPhone.slice(1)}`;
    console.log(phoneslice, otp);
    let user = await User.findOne({ numberPhone: phoneslice });
    // const verified = await verifyOtp(numberPhone, otp);
    const verified = await axios.post("https://chatapi.io.vn/dang-nhap", {
      sodienthoai: numberPhone,
      otp: otp,
    });
    if (!verified) {
      return res.status(401).json({ error: "Invalid OTP" });
    }
    if (!user) {
      user = new User({
        numberPhone: phoneslice,
        role: "user",
      });
      await user.save();
    }
    // Tạo JWT token
    // const token = jwt.sign( {numberPhone : user.numberPhone, OTP: otp, role: user.role}, process.env.JWT_SECRET, {algorithm: "HS256", expiresIn: '8h'}, );

    res.json({ message: "Login successful", token: verified.data });
  } catch (err) {
    logger.error(`authController.signin ${err}`);
    return res.status(401).json({ error: "Authentication failed" });
  }
}

//GET User
async function Getuser(req, res, next) {
  const getUser = await User.find({});
  await res.json(getUser);
}

//GET userProfile
async function userProfile(req, res, next) {
  try {
    const user = req.user;
    res.json(user);
  } catch {
    res.status(404).json({ error: "User not found" });
  }
}

//PUT cập nhập thông tin bị thiếu của khách hàng
async function fillInInformation(req, res, next) {
  const user = req.user;
  const result = await User.updateOne(
    { uid: user.uid },
    { $set: { name: req.body.name } },
  );
  res.json(result);
}
// routes/sign-in.js
async function logout(req, res, next) {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("authToken", {
      httpOnly: true,
      secure: isProduction, // true nếu deploy
      sameSite: isProduction ? "None" : "Lax", // None nếu khác origin
      path: "/",
    });
    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    logger.error(`authController.logout ${error}`);
    return res.status(500).json({ error: "Failed to logout" });
  }
}

// chỉnh sửa thông tin
async function editProfile(req, res, next) {
  try {
    const user = req.user;
    const result = await User.updateOne(
      { numberPhone: user.numberPhone },
      {
        $set: {
          name: req.body.name,
        },
      },
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to edit profile" });
  }
}

//  chỉnh sửa thông tin khách hàng bằng tài khoản admin
async function editUserByAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const { name, role } = req.body;
    const result = await User.updateOne(
      { _id: id },
      { $set: { name: name, role: role } },
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to edit user by admin" });
  }
}
// lấy ra thông tin của tài khoản bằng tài khoản admin
async function getUserByAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to get user by admin" });
  }
}

async function notification(req, res, next) {
  try {
    const result = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to get user by admin" });
  }
}

const decodePhone = async (req, res) => {
  const endpoint = "https://graph.zalo.me/v2.0/me/info";
  const userAccessToken = req.body.accessToken;
  const token = req.body.token;
  const secretKey = process.env.ZALO_SECRETKEY;

  const options = {
    url: endpoint,
    headers: {
      access_token: userAccessToken,
      code: token,
      secret_key: secretKey,
    },
  };

  request(options, (error, response, body) => {
    if (error) {
      console.error("Error:", error);
    } else {
      console.log("Response Code:", response.statusCode);
      console.log("Response Body:", body);
      const data = JSON.parse(body);
      res.json(data);
    }
  });
};

const verifySignature = async (req, res) => {
  console.log(req.body);
  res.send("hello");
};

const createHmacSignature = async (req, res) => {
  const { amount, desc, item } = req.body;

  // build đúng thứ tự, không sort
  const rawString = `amount=${amount}&desc=${desc}&item=${item}`;
  const mac = createHmac("sha256", "bd29abf8244696b5b6258171c6b097b3")
    .update(rawString)
    .digest("hex");

  res.json({ mac });
};

const approveKOC = async (req, res) => {
  try {
    const { numberPhone } = req.params;
    const result = await User.updateOne(
      { numberPhone: numberPhone },
      { $set: { role: "koc" } },
    );
    res.json(result);
  } catch (err) {
    return res.json(err);
  }
};

module.exports = {
  signin,
  Getuser,
  userProfile,
  fillInInformation,
  uploadBaner,
  GetBanner,
  deleteBanner,
  logout,
  editProfile,
  editUserByAdmin,
  getUserByAdmin,
  notification,
  decodePhone,
  verifySignature,
  createOTP,
  createHmacSignature,
  approveKOC,
  guiphanthuongvetinnhan,
};
