const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const router = require("./routers/index");
const db = require("./config/db/index");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require('http');
require("dotenv").config();
const { startWorker } = require('./app/queue/worker');

// --- 1. Cấu hình danh sách domain FE được phép ---
const whitelist = [
  "https://dt-group.netlify.app",
  "http://localhost:3000",
  "https://sieuthidt.com",
  "http://localhost:2999",
  "https://zmp.vn",
  "https://zalo.me"
];

// --- 2. Cấu hình cors động để trả đúng origin ---
const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép nếu không có origin (ví dụ postman/local) hoặc trong whitelist
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// --- 3. Đặt cookieParser và cors lên đầu ---
app.use(cookieParser());
app.use(cors(corsOptions));

// --- 4. Body parser ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 5. Static file ---
app.use(express.static("public"));

// --- 6. Xử lý preflight OPTIONS cho mọi route ---
app.options("*", cors(corsOptions)); // Rất quan trọng cho các route động!

// --- 7. Database ---
db.connect();

// --- 8. Router ---
router(app);

// --- 9. Queue Worker (nếu cần truy cập server) ---
const server = http.createServer(app);
startWorker(server);

// --- 10. Start server ---
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
