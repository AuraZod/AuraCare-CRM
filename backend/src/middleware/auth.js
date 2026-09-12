const authorizationService = require('../services/authorizationService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const auth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {

    const requestInfo = {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    };

    const { user, permissions, session, tokenClaims } = await authorizationService.validateTokenAndGetUser(token, requestInfo);

    if (session && session.autoExtend) {
      await session.updateActivity(requestInfo.ipAddress, requestInfo.userAgent);
    }

    req.user = user;
    req.permissions = permissions;
    req.session = session;
    req.tokenClaims = tokenClaims;

    next();
  } catch (error) {
    next(error);
  }
});

const authorize = (...roles) => {
  return authorizationService.requireRoles(...roles);
};

const requirePermission = (resource, action, conditionsFn = null) => {
  return authorizationService.requirePermission(resource, action, conditionsFn);
};

const requireOwnership = (resourceModel, ownerField = 'userId') => {
  return authorizationService.requireOwnership(resourceModel, ownerField);
};

const hasPermission = (resource, action, conditionsFn = null) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const conditions = conditionsFn ? conditionsFn(req) : {};
    const hasAccess = await authorizationService.canAccessResource(
      req.user.id,
      req.user.role,
      resource,
      action,
      conditions
    );

    if (!hasAccess) {
      return next(new AppError(`Permission denied for ${resource}:${action}`, 403));
    }

    next();
  });
};

module.exports = {
  auth,
  authenticate: auth,
  authorize,
  requirePermission,
  requireOwnership,
  hasPermission
};
