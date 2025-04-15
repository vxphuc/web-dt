const express = require('express')
const app = express()
const port = 5000
const router = require('./routers/index');
const db = require('./config/db/index');
const cors = require('cors')
require('dotenv').config()
const cookieParser = require('cookie-parser');


app.use(cookieParser());

app.use(cors({
  origin: "https://67f28886901b4b419e38b27f-teal-beigne.netlify.app", // CHỈ ĐỊNH chính xác FE
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));

//router
router(app);

//database
db.connect();


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })