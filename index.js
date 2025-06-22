const express = require("express");
const app = express();
const port = process.env.PORT || 5000;;
const router = require("./routers/index");
const db = require("./config/db/index");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const http = require('http')
const server = http.createServer(app);
const {startWorker} = require('./app/queue/worker');

app.use(cookieParser());

app.use(
  cors({
    origin: [
      "https://dt-group.netlify.app",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ], // CHỈ ĐỊNH chính xác FE
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


//router
router(app);

//database
db.connect();

startWorker(server)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
