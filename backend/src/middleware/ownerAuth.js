const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const ownerAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Access denied. Owner authentication required.', 401));
  }

  try {

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('No user found with this token', 401));
    }

    if (user.role !== 'owner') {
      return next(new AppError('Access denied. Only software owner can perform this action.', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Access denied. Invalid token.', 401));
  }
});

module.exports = ownerAuth;
