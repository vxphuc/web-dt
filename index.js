//gửi người anh em lập trình
//
// lúc tôi đang viết đống code này,
// chỉ có chúa với tui là hiểu nó chạy kiểu gì
//
//giờ thì... xin chia buồn,
//chỉ còn mỗi chúa hiểu thôi!
//
//nên nếu bro đang cố tối ưu,
//cái mớ này và nó toang (99% là vậy)
//thì làm ơn tăng cái biến đếm này lên
//để người xui xẻo tiếp theo còn biết đường chạy
//
//total_hours_wasted_here = 1

const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const router = require("./routers/index");
const db = require("./config/db/index");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const { connectRedis } = require("./config/redis");

const server = http.createServer(app);
const { Server } = require("socket.io");

// ========================
//  CẤU HÌNH SOCKET.IO CORS
// ========================


const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://sieuthidt.com",
      "https://h5.zdn.vn",
      // "https://chatapi.io.vn",
      "https://besieuthidt.io.vn",
      "https://www.besieuthidt.io.vn",
      "http://localhost:8001",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

(async () => {
  // --- 1. Express CORS ---
  const whitelist = [
    "https://dt-group.netlify.app",
    "http://localhost:3000",
    "https://sieuthidt.com",
    "http://localhost:2999",
    "https://h5.zdn.vn",
    "https://test.sieuthidt.io.vn",
    "http://test.sieuthidt.io.vn",
    "https://besieuthidt.io.vn",
    "https://www.besieuthidt.io.vn"
  ];

  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  };

  app.use(cookieParser());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(express.static("public"));
  const flipbookOutputDirectory = path.join(__dirname, "output");
  fs.mkdirSync(flipbookOutputDirectory, { recursive: true });
  app.use("/output", express.static(flipbookOutputDirectory));
  app.options("*", cors(corsOptions));

  // Gắn io vào app để controller sử dụng
  app.set("io", io);

  // --- 2. DB + Redis ---
  db.connect();
  await connectRedis();

  // --- 3. SOCKET.IO EVENTS ---

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    socket.on("join-order", (order_id) => {
      console.log(order_id);
      socket.join(order_id.toString());
      console.log(`Client ${socket.id} joined room: ${order_id}`);
    });
  });

  // --- 4. Router ---

  router(app);



  // --- 5. Server ---
  server.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
})();
