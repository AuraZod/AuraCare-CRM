const UserActivity = require('../models/UserActivity');
const logger = require('../utils/logger');

const activityTracker = (req, res, next) => {

  const skipEndpoints = [
    '/api/auth/me',
    '/api/users/profile',
    '/health',
    '/favicon.ico'
  ];

  const shouldSkip = skipEndpoints.some(endpoint => req.path.includes(endpoint)) ||
                   req.path.includes('/static/') ||
                   req.path.includes('/assets/');

  if (shouldSkip) {
    return next();
  }

  const startTime = Date.now();

  const originalJson = res.json;
  const originalSend = res.send;

  res.json = function(data) {
    captureActivity(req, res, startTime, data);
    return originalJson.call(this, data);
  };

  res.send = function(data) {
    captureActivity(req, res, startTime, data);
    return originalSend.call(this, data);
  };

  next();
};

const captureActivity = async (req, res, startTime, responseData) => {
  try {

    if (!req.user) {
      return;
    }

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const deviceInfo = parseUserAgent(req.get('User-Agent'));

    const action = determineAction(req.method, req.path);

    const resource = determineResource(req.path);

    const resourceId = extractResourceId(req.path, req.params);

    const success = res.statusCode >= 200 && res.statusCode < 400;

    const activityData = {
      userId: req.user._id,
      sessionId: req.session?._id,
      action: action,
      resource: resource,
      resourceId: resourceId,
      method: req.method,
      endpoint: req.path,
      statusCode: res.statusCode,
      responseTime: responseTime,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      deviceInfo: deviceInfo,
      success: success,
      timestamp: new Date(startTime),
      metadata: {
        query: req.query,
        bodySize: req.get('Content-Length') || 0,
        responseSize: JSON.stringify(responseData || {}).length,
        referer: req.get('Referer'),
        acceptLanguage: req.get('Accept-Language')
      }
    };

    if (!success && responseData && responseData.message) {
      activityData.errorMessage = responseData.message;
    }

    setImmediate(async () => {
      try {
        await UserActivity.create(activityData);
      } catch (error) {
        logger.error('Failed to save user activity:', error);
      }
    });

  } catch (error) {
    logger.error('Error in activity tracker:', error);
  }
};

const parseUserAgent = (userAgent) => {
  if (!userAgent) {
    return {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'Unknown',
      isMobile: false
    };
  }

  const deviceInfo = {
    browser: 'Unknown',
    os: 'Unknown',
    device: 'Desktop',
    isMobile: false
  };

  if (userAgent.includes('Chrome')) {
    deviceInfo.browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    deviceInfo.browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    deviceInfo.browser = 'Safari';
  } else if (userAgent.includes('Edge')) {
    deviceInfo.browser = 'Edge';
  } else if (userAgent.includes('Opera')) {
    deviceInfo.browser = 'Opera';
  }

  if (userAgent.includes('Windows')) {
    deviceInfo.os = 'Windows';
  } else if (userAgent.includes('Mac OS')) {
    deviceInfo.os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    deviceInfo.os = 'Linux';
  } else if (userAgent.includes('Android')) {
    deviceInfo.os = 'Android';
    deviceInfo.isMobile = true;
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    deviceInfo.os = 'iOS';
    deviceInfo.isMobile = userAgent.includes('iPhone');
  }

  if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
    deviceInfo.device = 'Mobile';
    deviceInfo.isMobile = true;
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    deviceInfo.device = 'Tablet';
  }

  return deviceInfo;
};

const determineAction = (method, path) => {
  const pathSegments = path.split('/').filter(segment => segment);

  switch (method) {
    case 'GET':
      if (pathSegments.length > 2 && !isNaN(pathSegments[2])) {
        return 'view';
      }
      return pathSegments.includes('search') ? 'search' : 'list';
    case 'POST':
      if (path.includes('login')) return 'login';
      if (path.includes('logout')) return 'logout';
      if (path.includes('export')) return 'export';
      if (path.includes('backup')) return 'backup';
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return 'unknown';
  }
};

const determineResource = (path) => {
  const pathSegments = path.split('/').filter(segment => segment);

  if (pathSegments.length < 2) return 'unknown';

  const resourceSegment = pathSegments[1];

  const resourceMap = {
    'auth': 'authentication',
    'users': 'users',
    'patients': 'patients',
    'appointments': 'appointments',
    'prescriptions': 'prescriptions',
    'test-orders': 'test_orders',
    'inventory': 'inventory',
    'equipment': 'equipment',
    'billing': 'billing',
    'reports': 'reports',
    'dashboard': 'dashboard',
    'settings': 'settings',
    'data-management': 'data_management'
  };

  return resourceMap[resourceSegment] || resourceSegment;
};

const extractResourceId = (path, params) => {

  if (params && params.id) {
    return params.id;
  }

  const pathSegments = path.split('/').filter(segment => segment);
  for (const segment of pathSegments) {

    if (/^[0-9a-fA-F]{24}$/.test(segment) || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(segment)) {
      return segment;
    }
  }

  return null;
};

const trackPageView = (req, res, next) => {
  if (req.user && req.method === 'GET') {

    setImmediate(async () => {
      try {
        await UserActivity.create({
          userId: req.user._id,
          sessionId: req.session?._id,
          action: 'page_view',
          resource: determineResource(req.path),
          method: 'GET',
          endpoint: req.path,
          statusCode: 200,
          responseTime: 0,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          deviceInfo: parseUserAgent(req.get('User-Agent')),
          success: true,
          metadata: {
            referer: req.get('Referer'),
            query: req.query
          }
        });
      } catch (error) {
        logger.error('Failed to track page view:', error);
      }
    });
  }
  next();
};

module.exports = {
  activityTracker,
  trackPageView
};
