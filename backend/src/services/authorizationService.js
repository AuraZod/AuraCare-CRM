const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const AuditLog = require('../models/AuditLog');
const { USER_ROLES, ROLE_PERMISSIONS, ROLE_RESTRICTIONS } = require('../types/rbac');
const config = require('../config');
const AppError = require('../utils/AppError');

class AuthorizationService {

  async validateTokenAndGetUser(token, requestInfo = {}) {
    try {

      const decoded = jwt.verify(token, config.JWT_SECRET);

      const session = await Session.findOne({
        jti: decoded.jti,
        isActive: true
      });

      if (!session || session.isExpired()) {
        await this.logSecurityEvent({
          action: 'token_validation_failed',
          reason: 'Session expired or invalid',
          token: token.substring(0, 10) + '...',
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent
        });
        throw new AppError('Invalid or expired token', 401);
      }

      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        await this.logSecurityEvent({
          action: 'token_validation_failed',
          reason: 'User not found or inactive',
          userId: decoded.id,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent
        });
        throw new AppError('User not found or inactive', 401);
      }

      session.lastActivity = new Date();
      await session.save();

      const permissions = this.getUserPermissions(user.role);

      return {
        user,
        permissions,
        session,
        tokenClaims: decoded
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        await this.logSecurityEvent({
          action: 'token_validation_failed',
          reason: error.message,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent
        });
        throw new AppError('Invalid or expired token', 401);
      }
      throw error;
    }
  }

  getUserPermissions(role) {
    return ROLE_PERMISSIONS[role] || [];
  }

  hasPermission(userRole, resource, action, conditions = {}) {
    const permissions = this.getUserPermissions(userRole);

    const hasPermission = permissions.some(permission => {
      if (permission.resource !== resource || permission.action !== action) {
        return false;
      }

      if (permission.conditions && Object.keys(permission.conditions).length > 0) {
        return this.checkConditions(permission.conditions, conditions);
      }

      return true;
    });

    const restrictions = ROLE_RESTRICTIONS[userRole] || [];
    const isRestricted = restrictions.some(restriction => {
      if (restriction.resource !== resource) {
        return false;
      }

      if (restriction.actions.includes(action)) {

        if (restriction.conditions) {
          return this.checkConditions(restriction.conditions, conditions);
        }
        return true;
      }

      return false;
    });

    return hasPermission && !isRestricted;
  }

  checkConditions(permissionConditions, requestConditions) {
    for (const [key, value] of Object.entries(permissionConditions)) {
      if (requestConditions[key] !== value) {
        return false;
      }
    }
    return true;
  }

  async canAccessResource(userId, userRole, resource, action, resourceData = {}) {

    if (!this.hasPermission(userRole, resource, action, resourceData)) {
      return false;
    }

    switch (userRole) {
      case USER_ROLES.DOCTOR:

        if (resource === 'schedule' && resourceData.doctorId && resourceData.doctorId !== userId) {
          return false;
        }
        break;

      case USER_ROLES.RECEPTIONIST:

        if (resource === 'billing' && action === 'edit' && resourceData.isPastBill) {
          return false;
        }
        break;

      case USER_ROLES.DIAGNOSTIC:

        if (resource === 'prescriptions' && ['create', 'update', 'delete'].includes(action)) {
          return false;
        }
        break;

      case USER_ROLES.PHARMACY:

        if (resource === 'prescriptions' && action === 'update' && resourceData.scope === 'doctor_notes') {
          return false;
        }
        break;
    }

    return true;
  }

  async logSecurityEvent(eventData) {
    try {
      await AuditLog.create({
        userId: eventData.userId || null,
        action: eventData.action,
        resource: 'security',
        resourceId: eventData.resourceId,
        ipAddress: eventData.ipAddress,
        userAgent: eventData.userAgent,
        success: false,
        errorMessage: eventData.reason,
        metadata: {
          token: eventData.token,
          ...eventData.metadata
        }
      });
    } catch (error) {
      console.error('Security event logging failed:', error);
    }
  }

  async logAccessAttempt(accessData) {
    try {
      await AuditLog.create({
        userId: accessData.userId,
        action: accessData.action,
        resource: accessData.resource,
        resourceId: accessData.resourceId,
        ipAddress: accessData.ipAddress,
        userAgent: accessData.userAgent,
        success: accessData.success,
        errorMessage: accessData.errorMessage,
        metadata: accessData.metadata || {}
      });
    } catch (error) {
      console.error('Access attempt logging failed:', error);
    }
  }

  requireRoles(...allowedRoles) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return next(new AppError('Authentication required', 401));
        }

        if (!allowedRoles.includes(req.user.role)) {
          await this.logAccessAttempt({
            userId: req.user.id,
            action: 'access_denied',
            resource: req.route?.path || req.path,
            success: false,
            errorMessage: `Role ${req.user.role} not authorized`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            metadata: { allowedRoles, userRole: req.user.role }
          });

          return next(new AppError(`Access denied. Required roles: ${allowedRoles.join(', ')}`, 403));
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  requirePermission(resource, action, conditionsFn = null) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return next(new AppError('Authentication required', 401));
        }

        const conditions = conditionsFn ? conditionsFn(req) : {};
        const hasAccess = await this.canAccessResource(
          req.user.id,
          req.user.role,
          resource,
          action,
          conditions
        );

        if (!hasAccess) {
          await this.logAccessAttempt({
            userId: req.user.id,
            action: 'permission_denied',
            resource: resource,
            resourceId: req.params.id,
            success: false,
            errorMessage: `Permission denied for ${resource}:${action}`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            metadata: { resource, action, conditions, userRole: req.user.role }
          });

          return next(new AppError(`Permission denied for ${resource}:${action}`, 403));
        }

        await this.logAccessAttempt({
          userId: req.user.id,
          action: 'access_granted',
          resource: resource,
          resourceId: req.params.id,
          success: true,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          metadata: { resource, action, conditions, userRole: req.user.role }
        });

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  requireOwnership(resourceModel, ownerField = 'userId') {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return next(new AppError('Authentication required', 401));
        }

        const resourceId = req.params.id;
        if (!resourceId) {
          return next(new AppError('Resource ID required', 400));
        }

        const Model = require(`../models/${resourceModel}`);
        const resource = await Model.findById(resourceId);

        if (!resource) {
          return next(new AppError('Resource not found', 404));
        }

        const ownerId = resource[ownerField]?.toString();
        if (ownerId !== req.user.id) {
          await this.logAccessAttempt({
            userId: req.user.id,
            action: 'ownership_denied',
            resource: resourceModel.toLowerCase(),
            resourceId: resourceId,
            success: false,
            errorMessage: 'User does not own this resource',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            metadata: { ownerId, userId: req.user.id }
          });

          return next(new AppError('Access denied. You do not own this resource', 403));
        }

        req.resource = resource;
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

module.exports = new AuthorizationService();
