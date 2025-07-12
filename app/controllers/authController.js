const User = require("../models/user"); //model
const admin = require("../../config/firebaseConfig");
const Banner = require("../models/banner");
const fs = require("fs");
const path = require("path");
const { queueInstance } = require("../queue/index");
const Notification = require("../models/Notification");
const axios = require("axios");

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

//POST create and login
async function signin(req, res, next) {
  const { idToken } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    let user = await User.findOne({ uid: decodedToken.uid });

    if (!user) {
      user = await new User({
        uid: decodedToken.uid,
        ...req.body,
      });
      await user.save();
    }
    const isProduction = process.env.NODE_ENV === "production";

    // res.cookie("authToken", idToken, {
    //   httpOnly: true,
    //   secure: isProduction, // true nếu deploy
    //   sameSite: isProduction ? "None" : "Lax", // None nếu khác origin
    //   path: "/",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    res.json({ message: "Login successful", user });
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
    res.json({
      uid: user.uid, // UID của người dùng từ Firebase
      name: user.name,
      phone: user.numberPhone, // Số điện thoại đã đăng ký
      token: user.token, // Token mua hàng
      role: user.role, // Vai trò của người dùng
      gender: user.gender, // Giới tính của người dùng
    });
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

// lấy số điện thoại từ zalo
// const zaloPhone = async (req, res) => {
//   try {
//     const { token } = req.body;
//     const respons = axios.post(
//       "https://openapi.zalo.me/v3/user/info",
//       {
//         code: token,
//       },
//       {
//         headers: {
//           access_token: 1551304423954723698,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   } catch (err) {
//     console.log(err);
//   }
// };

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
};
