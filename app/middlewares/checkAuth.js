const User = require('../models/user') // model user
const admin = require('../../config/firebaseConfig')

const checkAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split("Bearer ")[1];
    
    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user = await User.findOne({ uid: decodedToken.uid });
  
      if (!user) return res.status(401).json({ error: "Unauthorized: User not found" });
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };
  
  module.exports = checkAuth;