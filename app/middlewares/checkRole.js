const User = require('../models/user')

const checkRole = (roleUser) => {
      return (req, res, next) => {
        if(!req.user){
          return res.status(401).json({message: 'You are not logged in'})
        }
        if(req.user.role !== roleUser){
          return res.status(403).json({ error: `Forbidden: You need ${role} role` });
        }

        next()
      }
  };

  module.exports = checkRole