// middleware/auth.js (sửa lại)
const User = require('../models/user');
const jwt = require("jsonwebtoken");
require('dotenv').config();

const checkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) 
    return res.status(401).json({ error: 'Unauthorized: No token provided' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') 
    return res.status(401).json({ error: 'Unauthorized: Bad token format' });

  const token = parts[1];
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ numberPhone: decodedToken.numberPhone })
    if (!user) return res.status(401).json({ error: 'Unauthorized: User not found' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
module.exports = checkAuth;
