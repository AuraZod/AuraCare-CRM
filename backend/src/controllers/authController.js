const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const authService = require('../services/authService');
const { USER_ROLES } = require('../types/rbac');

const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, profile } = req.body;

  if (!Object.values(USER_ROLES).includes(role)) {
    return next(new AppError('Invalid role specified', 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists', 400));
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    profile: profile || {
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1] || ''
    }
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
    },
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password, rememberMe = true } = req.body;

  const requestInfo = {
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  };

  const sessionOptions = {
    rememberMe: rememberMe,
    sessionType: rememberMe ? 'extended' : 'standard'
  };

  const result = await authService.authenticate(email, password, requestInfo, sessionOptions);

  res.json(result);
});

const logout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  const requestInfo = {
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  };

  const result = await authService.logout(token, requestInfo);

  res.json(result);
});

const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  const session = req.session;

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      permissions: req.permissions,
      lastLogin: user.lastLogin
    },
    session: {
      sessionType: session.sessionType,
      autoExtend: session.autoExtend,
      lastActivity: session.lastActivity,
      expiresAt: session.expiresAt,
      deviceInfo: session.deviceInfo
    }
  });
});

const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  const requestInfo = {
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  };

  const result = await authService.refreshAccessToken(refreshToken, requestInfo);

  res.json(result);
});

const getUserSessions = asyncHandler(async (req, res) => {
  const sessions = await authService.getUserSessions(req.user._id);

  res.json({
    success: true,
    sessions: sessions
  });
});

const invalidateOtherSessions = asyncHandler(async (req, res) => {
  const currentJti = req.tokenClaims.jti;
  const result = await authService.invalidateOtherSessions(req.user._id, currentJti);

  res.json(result);
});

module.exports = {
  createUser,
  login,
  logout,
  getMe,
  refreshToken,
  getUserSessions,
  invalidateOtherSessions
};
