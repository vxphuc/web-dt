const User = require("../models/user"); //model
const admin = require("../../config/firebaseConfig");
const Banner = require("../models/banner");
const fs = require("fs");
const path = require("path");

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
      link = path.join(__dirname, "..","..", "public", "uploads", img.image);
      fs.unlink(link, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("file deleted");
        }
      });
    });
    Banner.deleteOne({_id: req.params.id})
      .then((result) => console.log(result))
      .catch(error => console.error(error));
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
    { $set: { name: req.body.name, gender: req.body.gender } }
  );
}

module.exports = {
  signin,
  Getuser,
  userProfile,
  fillInInformation,
  uploadBaner,
  GetBanner,
  deleteBanner,
};
