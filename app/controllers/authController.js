const User = require("../models/user"); //model
const admin = require("../../config/firebaseConfig");
const Banner = require("../models/banner");
const fs = require("fs");
const path = require("path");
const Notification = require("../models/Notification");
const axios = require("axios");
const request = require("request");
const { createOtp, verifyOtp } = require("../../services/otpService");
require('dotenv').config();
const jwt = require("jsonwebtoken");


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
    res.status(500).json({ message: "Lỗi server" });
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
  } catch {
    res.json("lỗi khi xóa");
  }
}

// POST tạo OTP và gửi otp
async function createOTP(req, res, next) {
  const { numberPhone } = req.body;
  const otp = await createOtp(numberPhone);
  const zaloRes = await axios.post('https://business.openapi.zalo.me/message/template',{
    phone: numberPhone,
    template_id: process.env.ZALOPAY_OTP,
    template_data: {
      otp: otp,
    },
  },{
    headers: {
      'Content-Type': 'application/json',
      'access_token': process.env.ZALOPAY_ACCESS_TOKEN, // Ensure you have this token in your .env file
    },
  })
  res.status(200).json({ message: "OTP sent successfully", numberPhone, otp, data: zaloRes.data});
}
//POST create and login
async function signin(req, res, next) {
  // const { idToken } = req.body;
  const { numberPhone, otp } = req.body;
  try {
    let user = await User.findOne({ numberPhone: req.body.numberPhone });
    const verified = await verifyOtp(numberPhone, otp);
    if(!verified) {
      return res.status(401).json({ error: "Invalid OTP" });
    }
    if (!user) {
      user = new User({
        numberPhone: numberPhone,
        role: "user",
      });
      await user.save();
    }
    // Tạo JWT token
    const token = jwt.sign( {numberPhone : user.numberPhone}, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ message: "Login successful", token });
  } catch {
    res.status(401).json({ error: "Authentication failed" });
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
    const numberPhone = req.query.numberPhone
    const user_profile = await User.findOne({ numberPhone }).lean();
    res.json(user_profile);
  } catch {
    res.status(404).json({ error: "User not found" });
  }
}

//PUT cập nhập thông tin bị thiếu của khách hàng
async function fillInInformation(req, res, next) {
  const user = req.user;
  const result = await User.updateOne(
    { uid: user.uid },
    { $set: { name: req.body.name } }
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
    res.status(500).json({ error: "Failed to logout" });
  }
}

// chỉnh sửa thông tin
async function editProfile(req, res, next) {
  try {
    const user = req.user;
    const result = await User.updateOne(
      { uid: user.uid },
      {
        $set: {
          name: req.body.name,
          gender: req.body.sex,
          numberPhone: req.body.numberPhone,
        },
      }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to edit profile" });
  }
}

//  chỉnh sửa thông tin khách hàng bằng tài khoản admin
async function editUserByAdmin(req, res, next) {
  try {
    const { uid } = req.params;
    const { name, gender, role } = req.body;
    const result = await User.updateOne(
      { uid: uid },
      { $set: { name: name, gender: gender, role: role } }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to edit user by admin" });
  }
}
// lấy ra thông tin của tài khoản bằng tài khoản admin
async function getUserByAdmin(req, res, next) {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid: uid });
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
  const secretKey = "TU4QIsG3TvIF77FMHBB8";


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
      res.json(data)
    }
  });
};

const verifySignature = async (req, res) =>{
  console.log(req.body)
  res.send('hello')
}

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
  createOTP
};
