const express = require('express')
const app = express()
const port = 5000
const router = require('./routers/index');
const db = require('./config/db/index');
const cors = require('cors')
require('dotenv').config()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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