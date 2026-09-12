const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const User = require('../models/User');
const Session = require('../models/Session');
const AuditLog = require('../models/AuditLog');
const { USER_ROLES, ROLE_PERMISSIONS } = require('../types/rbac');
const config = require('../config');
const AppError = require('../utils/AppError');

class AuthService {

  async validateCredentials(email, password) {
    try {

      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      const user = await User.findOne({
        email: email.toLowerCase(),
        isActive: true
      }).select('+password');

      if (!user) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      user.lastLogin = new Date();
      await user.save();

      return user;
    } catch (error) {
      throw error;
    }
  }

  async generateTokens(user, options = {}) {
    try {
      const jti = randomUUID();
      const permissions = this.getUserPermissions(user.role);

      const sessionType = options.sessionType || 'standard';
      const rememberMe = options.rememberMe === true;

      let tokenExpiry, refreshExpiry;
      if (sessionType === 'extended' || rememberMe) {
        tokenExpiry = config.SESSION_MAX_AGE || '30d';
        refreshExpiry = config.JWT_REFRESH_EXPIRE || '60d';
      } else {
        tokenExpiry = config.JWT_EXPIRE || '15m';
        refreshExpiry = '7d';
      }

      const accessPayload = {
        id: user._id,
        email: user.email,
        role: user.role,
        permissions: permissions.map(p => `${p.resource}:${p.action}`),
        jti: jti,
        sessionType: sessionType
      };

      const accessToken = jwt.sign(accessPayload, config.JWT_SECRET, {
        expiresIn: tokenExpiry,
        issuer: 'hospital-crm',
        audience: 'hospital-staff'
      });

      const refreshToken = jwt.sign(
        { id: user._id, jti: jti, sessionType: sessionType },
        config.JWT_REFRESH_SECRET || config.JWT_SECRET,
        {
          expiresIn: refreshExpiry,
          issuer: 'hospital-crm',
          audience: 'hospital-staff'
        }
      );

      const expiresAt = new Date(Date.now() + this.getTokenExpiry(tokenExpiry));
      const maxInactivityPeriod = sessionType === 'extended' ?
        this.getTokenExpiry('30d') : this.getTokenExpiry('24h');

      await Session.create({
        userId: user._id,
        token: accessToken,
        refreshToken: refreshToken,
        jti: jti,
        isActive: true,
        expiresAt: expiresAt,
        lastActivity: new Date(),
        sessionType: sessionType,
        maxInactivityPeriod: maxInactivityPeriod,
        autoExtend: rememberMe,
        deviceInfo: options.deviceInfo || null,
        location: options.location || null
      });

      return {
        accessToken,
        refreshToken,
        jti,
        expiresIn: this.getTokenExpiry(tokenExpiry),
        sessionType: sessionType,
        autoExtend: rememberMe
      };
    } catch (error) {
      throw new AppError('Token generation failed', 500);
    }
  }

  getUserPermissions(role) {
    return ROLE_PERMISSIONS[role] || [];
  }

  getTokenExpiry(expiry) {
    const units = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    };

    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 30 * 24 * 60 * 60 * 1000;

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  async logAuditEvent(eventData) {
    try {
      await AuditLog.create({
        userId: eventData.userId,
        action: eventData.action,
        resource: eventData.resource,
        resourceId: eventData.resourceId,
        ipAddress: eventData.ipAddress,
        userAgent: eventData.userAgent,
        success: eventData.success,
        errorMessage: eventData.errorMessage,
        metadata: eventData.metadata || {}
      });
    } catch (error) {

      console.error('Audit log creation failed:', error);
    }
  }

  async authenticate(email, password, requestInfo = {}, sessionOptions = {}) {
    try {

      const user = await this.validateCredentials(email, password);

      if (!user) {

        await this.logAuditEvent({
          userId: null,
          action: 'login_failed',
          resource: 'authentication',
          success: false,
          errorMessage: 'Invalid credentials',
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent
        });

        throw new AppError('Invalid credentials', 401);
      }

      const defaultSessionOptions = {
        sessionType: 'extended',
        rememberMe: sessionOptions.rememberMe !== false,
        deviceInfo: this.extractDeviceInfo(requestInfo.userAgent),
        location: requestInfo.location || null,
        ...sessionOptions
      };

      const tokens = await this.generateTokens(user, defaultSessionOptions);

      await this.logAuditEvent({
        userId: user._id,
        action: 'login_success',
        resource: 'authentication',
        success: true,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        metadata: {
          role: user.role,
          sessionType: defaultSessionOptions.sessionType,
          autoExtend: tokens.autoExtend
        }
      });

      return {
        success: true,
        message: 'Authentication successful - Session valid for 30 days',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        sessionType: tokens.sessionType,
        autoExtend: tokens.autoExtend,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: user.profile,
          permissions: this.getUserPermissions(user.role)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshAccessToken(refreshToken, requestInfo = {}) {
    try {

      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET || config.JWT_SECRET);

      const session = await Session.findOne({
        jti: decoded.jti,
        refreshToken: refreshToken,
        isActive: true
      }).populate('userId');

      if (!session || session.isExpired()) {
        throw new AppError('Invalid or expired refresh token', 401);
      }

      const user = session.userId;
      if (!user || !user.isActive) {
        await session.invalidate();
        throw new AppError('User account is inactive', 401);
      }

      const jti = randomUUID();
      const permissions = this.getUserPermissions(user.role);

      const accessPayload = {
        id: user._id,
        email: user.email,
        role: user.role,
        permissions: permissions.map(p => `${p.resource}:${p.action}`),
        jti: jti,
        sessionType: session.sessionType
      };

      const newAccessToken = jwt.sign(accessPayload, config.JWT_SECRET, {
        expiresIn: session.sessionType === 'extended' ? config.SESSION_MAX_AGE : '24h',
        issuer: 'hospital-crm',
        audience: 'hospital-staff'
      });

      session.token = newAccessToken;
      session.jti = jti;
      await session.updateActivity(requestInfo.ipAddress, requestInfo.userAgent);

      await this.logAuditEvent({
        userId: user._id,
        action: 'token_refreshed',
        resource: 'authentication',
        success: true,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        metadata: { sessionId: session._id }
      });

      return {
        success: true,
        accessToken: newAccessToken,
        expiresIn: this.getTokenExpiry(session.sessionType === 'extended' ? config.SESSION_MAX_AGE : '24h'),
        sessionType: session.sessionType
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new AppError('Invalid or expired refresh token', 401);
      }
      throw error;
    }
  }

  async logout(token, requestInfo = {}) {
    try {

      const decoded = jwt.verify(token, config.JWT_SECRET);

      const session = await Session.findOne({ jti: decoded.jti });
      if (session) {
        await session.invalidate();

        await this.logAuditEvent({
          userId: decoded.id,
          action: 'logout',
          resource: 'authentication',
          success: true,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
          metadata: { sessionId: session._id }
        });
      }

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {

      return {
        success: true,
        message: 'Logged out successfully'
      };
    }
  }

  extractDeviceInfo(userAgent) {
    if (!userAgent) return 'Unknown Device';

    if (userAgent.includes('Mobile')) return 'Mobile Device';
    if (userAgent.includes('Tablet')) return 'Tablet';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux PC';

    return 'Unknown Device';
  }

  async getUserSessions(userId) {
    try {
      const sessions = await Session.find({
        userId: userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      }).select('deviceInfo ipAddress lastActivity sessionType createdAt');

      return sessions;
    } catch (error) {
      throw new AppError('Failed to retrieve user sessions', 500);
    }
  }

  async invalidateOtherSessions(userId, currentJti) {
    try {
      const result = await Session.updateMany(
        {
          userId: userId,
          jti: { $ne: currentJti },
          isActive: true
        },
        { isActive: false }
      );

      return {
        success: true,
        message: `Invalidated ${result.modifiedCount} other sessions`
      };
    } catch (error) {
      throw new AppError('Failed to invalidate sessions', 500);
    }
  }
}

module.exports = new AuthService();
