// middleware/auth.js (sửa lại)
const User = require('../models/user');
const admin = require('../../config/firebaseConfig');

const checkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) 
    return res.status(401).json({ error: 'Unauthorized: No token provided' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') 
    return res.status(401).json({ error: 'Unauthorized: Bad token format' });

  const token = parts[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ uid: decodedToken.uid });
    if (!user) return res.status(401).json({ error: 'Unauthorized: User not found' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
module.exports = checkAuth;
