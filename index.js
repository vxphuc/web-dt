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

(async () => {
  // --- 1. CORS ---
  const whitelist = [
    "https://dt-group.netlify.app",
    "http://localhost:3000",
    "https://sieuthidt.com",
    "http://localhost:2999",
    "https://h5.zdn.vn"
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
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.options("*", cors(corsOptions));

  // --- 2. Kết nối DB và Redis ---
  db.connect();
  await connectRedis(); // ✅ Chờ Redis connect xong mới chạy tiếp

  // --- 3. Router ---
  router(app);

  // --- 4. Server ---
  const server = http.createServer(app);
  server.listen(port, () => {
    console.log(`🚀 App listening on port ${port}`);
  });

})();
