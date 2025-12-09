const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const router = require("./routers/index");
const db = require("./config/db/index");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
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
      "https://dt-group.netlify.app",
      "http://localhost:3000",
      "http://localhost:2999",
      "https://sieuthidt.com",
      "https://h5.zdn.vn",
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
