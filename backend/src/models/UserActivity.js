const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: false
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    index: true
  },
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    trim: true,
    index: true
  },
  resourceId: {
    type: String,
    trim: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    required: [true, 'HTTP method is required']
  },
  endpoint: {
    type: String,
    required: [true, 'Endpoint is required'],
    trim: true
  },
  statusCode: {
    type: Number,
    required: [true, 'Status code is required']
  },
  responseTime: {
    type: Number,
    required: [true, 'Response time is required']
  },
  ipAddress: {
    type: String,
    trim: true,
    index: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  deviceInfo: {
    browser: String,
    os: String,
    device: String,
    isMobile: Boolean
  },
  location: {
    country: String,
    city: String,
    region: String,
    timezone: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  success: {
    type: Boolean,
    required: [true, 'Success status is required'],
    index: true
  },
  errorMessage: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ userId: 1, action: 1, timestamp: -1 });
userActivitySchema.index({ userId: 1, resource: 1, timestamp: -1 });
userActivitySchema.index({ action: 1, timestamp: -1 });
userActivitySchema.index({ resource: 1, timestamp: -1 });
userActivitySchema.index({ success: 1, timestamp: -1 });
userActivitySchema.index({ timestamp: -1 });

userActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

userActivitySchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toISOString();
});

userActivitySchema.statics.getUserActivitySummary = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalActions: { $sum: 1 },
        successfulActions: { $sum: { $cond: ['$success', 1, 0] } },
        failedActions: { $sum: { $cond: ['$success', 0, 1] } },
        avgResponseTime: { $avg: '$responseTime' },
        uniqueResources: { $addToSet: '$resource' },
        uniqueActions: { $addToSet: '$action' },
        lastActivity: { $max: '$timestamp' },
        firstActivity: { $min: '$timestamp' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalActions: 0,
    successfulActions: 0,
    failedActions: 0,
    avgResponseTime: 0,
    uniqueResources: [],
    uniqueActions: [],
    lastActivity: null,
    firstActivity: null
  };
};

userActivitySchema.statics.getActivityByPeriod = async function(userId, period = 'day', days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let groupBy;
  switch (period) {
    case 'hour':
      groupBy = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
        day: { $dayOfMonth: '$timestamp' },
        hour: { $hour: '$timestamp' }
      };
      break;
    case 'day':
      groupBy = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
        day: { $dayOfMonth: '$timestamp' }
      };
      break;
    case 'week':
      groupBy = {
        year: { $year: '$timestamp' },
        week: { $week: '$timestamp' }
      };
      break;
    default:
      groupBy = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
        day: { $dayOfMonth: '$timestamp' }
      };
  }

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: groupBy,
        count: { $sum: 1 },
        successCount: { $sum: { $cond: ['$success', 1, 0] } },
        failCount: { $sum: { $cond: ['$success', 0, 1] } },
        avgResponseTime: { $avg: '$responseTime' }
      }
    },
    { $sort: { '_id': 1 } }
  ];

  return await this.aggregate(pipeline);
};

userActivitySchema.statics.getMostUsedResources = async function(userId, limit = 10, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$resource',
        count: { $sum: 1 },
        successCount: { $sum: { $cond: ['$success', 1, 0] } },
        avgResponseTime: { $avg: '$responseTime' },
        lastUsed: { $max: '$timestamp' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ];

  return await this.aggregate(pipeline);
};

userActivitySchema.statics.getUserBehaviorPatterns = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          hour: { $hour: '$timestamp' },
          dayOfWeek: { $dayOfWeek: '$timestamp' }
        },
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$responseTime' }
      }
    },
    { $sort: { count: -1 } }
  ];

  return await this.aggregate(pipeline);
};

userActivitySchema.statics.cleanupOldActivities = async function(daysToKeep = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await this.deleteMany({
    timestamp: { $lt: cutoffDate }
  });

  return result;
};

module.exports = mongoose.model('UserActivity', userActivitySchema);
