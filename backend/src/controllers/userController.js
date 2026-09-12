const mongoose = require('mongoose');
const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const Session = require('../models/Session');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');

const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;
  const { role, includeActivity = 'true' } = req.query;

  const query = {};
  if (role) {
    query.role = role;
  }

  const users = await User.find(query).skip(skip).limit(limit).select('-password');
  const total = await User.countDocuments(query);

  let usersWithActivity = users;
  if (includeActivity === 'true') {
    usersWithActivity = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();

        const activitySummary = await UserActivity.getUserActivitySummary(user._id, 30);

        const activeSessions = await Session.find({
          userId: user._id,
          isActive: true,
          expiresAt: { $gt: new Date() }
        }).select('deviceInfo ipAddress lastActivity sessionType createdAt');

        const mostUsedResources = await UserActivity.getMostUsedResources(user._id, 5, 30);

        userObj.activitySummary = {
          ...activitySummary,
          uniqueResourcesCount: activitySummary.uniqueResources?.length || 0,
          uniqueActionsCount: activitySummary.uniqueActions?.length || 0,
          successRate: activitySummary.totalActions > 0
            ? ((activitySummary.successfulActions / activitySummary.totalActions) * 100).toFixed(2)
            : 0
        };

        userObj.activeSessions = activeSessions.map(session => ({
          id: session._id,
          deviceInfo: session.deviceInfo,
          ipAddress: session.ipAddress,
          lastActivity: session.lastActivity,
          sessionType: session.sessionType,
          duration: Math.floor((new Date() - session.createdAt) / (1000 * 60))
        }));

        userObj.mostUsedResources = mostUsedResources;

        return userObj;
      })
    );
  }

  res.json({
    success: true,
    data: usersWithActivity,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({
    role: 'doctor',
    isActive: true
  }).select('name email profile role phone').sort({ name: 1 });

  const transformedDoctors = doctors.map(doctor => ({
    _id: doctor._id,
    name: doctor.name,
    email: doctor.email,
    role: doctor.role,
    phone: doctor.phone,
    specialization: doctor.profile?.specialization || '',
    firstName: doctor.profile?.firstName || '',
    lastName: doctor.profile?.lastName || ''
  }));

  res.json({
    success: true,
    data: transformedDoctors,
    count: transformedDoctors.length
  });
});

const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone, specialization } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    phone,
    specialization,
    isActive: true
  });

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    data: userResponse,
    message: 'User created successfully'
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: user,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, additionalPerms } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email, additionalPerms },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: user,
  });
});

const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    data: user,
  });
});

const updateUser = asyncHandler(async (req, res, next) => {
  const updateData = { ...req.body };

  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(updateData.password, salt);
  }

  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    data: user,
  });
});

const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});

const getUserActivity = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    days = 30,
    page = 1,
    limit = 50,
    action,
    resource,
    success
  } = req.query;

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const query = {
    userId: id,
    timestamp: { $gte: startDate }
  };

  if (action) query.action = action;
  if (resource) query.resource = resource;
  if (success !== undefined) query.success = success === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const activities = await UserActivity.find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await UserActivity.countDocuments(query);

  const activitySummary = await UserActivity.getUserActivitySummary(id, parseInt(days));

  const activityByDay = await UserActivity.getActivityByPeriod(id, 'day', parseInt(days));

  const behaviorPatterns = await UserActivity.getUserBehaviorPatterns(id, parseInt(days));

  const mostUsedResources = await UserActivity.getMostUsedResources(id, 10, parseInt(days));

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      activities,
      summary: {
        ...activitySummary,
        uniqueResourcesCount: activitySummary.uniqueResources?.length || 0,
        uniqueActionsCount: activitySummary.uniqueActions?.length || 0,
        successRate: activitySummary.totalActions > 0
          ? ((activitySummary.successfulActions / activitySummary.totalActions) * 100).toFixed(2)
          : 0
      },
      activityByDay,
      behaviorPatterns,
      mostUsedResources,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getUserBehavior = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { days = 30 } = req.query;

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const [
    activitySummary,
    activityByHour,
    activityByDay,
    behaviorPatterns,
    mostUsedResources,
    deviceUsage,
    errorPatterns
  ] = await Promise.all([
    UserActivity.getUserActivitySummary(id, parseInt(days)),
    UserActivity.getActivityByPeriod(id, 'hour', 7),
    UserActivity.getActivityByPeriod(id, 'day', parseInt(days)),
    UserActivity.getUserBehaviorPatterns(id, parseInt(days)),
    UserActivity.getMostUsedResources(id, 15, parseInt(days)),
    getDeviceUsageStats(id, parseInt(days)),
    getErrorPatterns(id, parseInt(days))
  ]);

  const peakHours = behaviorPatterns
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(pattern => ({
      hour: pattern._id.hour,
      dayOfWeek: pattern._id.dayOfWeek,
      count: pattern.count,
      avgResponseTime: Math.round(pattern.avgResponseTime)
    }));

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      summary: {
        ...activitySummary,
        successRate: activitySummary.totalActions > 0
          ? ((activitySummary.successfulActions / activitySummary.totalActions) * 100).toFixed(2)
          : 0,
        avgSessionDuration: await getAvgSessionDuration(id, parseInt(days))
      },
      timePatterns: {
        byHour: activityByHour,
        byDay: activityByDay,
        peakHours
      },
      resourceUsage: mostUsedResources,
      deviceUsage,
      errorPatterns,
      behaviorInsights: generateBehaviorInsights(activitySummary, behaviorPatterns, mostUsedResources)
    }
  });
});

const getUserSessions = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { active = 'all', page = 1, limit = 20 } = req.query;

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const query = { userId: id };

  if (active === 'true') {
    query.isActive = true;
    query.expiresAt = { $gt: new Date() };
  } else if (active === 'false') {
    query.$or = [
      { isActive: false },
      { expiresAt: { $lte: new Date() } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sessions = await Session.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Session.countDocuments(query);

  const enhancedSessions = sessions.map(session => ({
    ...session,
    duration: Math.floor((new Date() - session.createdAt) / (1000 * 60)),
    isCurrentlyActive: session.isActive && session.expiresAt > new Date(),
    timeSinceLastActivity: Math.floor((new Date() - session.lastActivity) / (1000 * 60))
  }));

  res.json({
    success: true,
    data: {
      sessions: enhancedSessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

const getDeviceUsageStats = async (userId, days) => {
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
          browser: '$deviceInfo.browser',
          os: '$deviceInfo.os',
          device: '$deviceInfo.device'
        },
        count: { $sum: 1 },
        lastUsed: { $max: '$timestamp' }
      }
    },
    { $sort: { count: -1 } }
  ];

  return await UserActivity.aggregate(pipeline);
};

const getErrorPatterns = async (userId, days) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate },
        success: false
      }
    },
    {
      $group: {
        _id: {
          resource: '$resource',
          action: '$action',
          statusCode: '$statusCode'
        },
        count: { $sum: 1 },
        lastOccurrence: { $max: '$timestamp' },
        avgResponseTime: { $avg: '$responseTime' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ];

  return await UserActivity.aggregate(pipeline);
};

const getAvgSessionDuration = async (userId, days) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sessions = await Session.find({
    userId: userId,
    createdAt: { $gte: startDate }
  }).lean();

  if (sessions.length === 0) return 0;

  const totalDuration = sessions.reduce((sum, session) => {
    const endTime = session.lastActivity || session.updatedAt || session.createdAt;
    const duration = endTime - session.createdAt;
    return sum + duration;
  }, 0);

  return Math.round(totalDuration / sessions.length / (1000 * 60));
};

const generateBehaviorInsights = (summary, patterns, resources) => {
  const insights = [];

  if (summary.totalActions > 100) {
    insights.push({
      type: 'high_activity',
      message: 'This user is highly active with frequent system usage',
      severity: 'info'
    });
  } else if (summary.totalActions < 10) {
    insights.push({
      type: 'low_activity',
      message: 'This user has low system activity - may need training or support',
      severity: 'warning'
    });
  }

  const successRate = summary.totalActions > 0
    ? (summary.successfulActions / summary.totalActions) * 100
    : 0;

  if (successRate < 80) {
    insights.push({
      type: 'high_error_rate',
      message: `User has a ${(100 - successRate).toFixed(1)}% error rate - may need assistance`,
      severity: 'error'
    });
  }

  if (resources.length > 0) {
    const topResource = resources[0];
    insights.push({
      type: 'primary_function',
      message: `Primary system usage: ${topResource._id} (${topResource.count} actions)`,
      severity: 'info'
    });
  }

  return insights;
};

module.exports = {
  getUsers,
  getDoctors,
  createUser,
  getProfile,
  updateProfile,
  getUserById,
  updateUser,
  deleteUser,
  getUserActivity,
  getUserBehavior,
  getUserSessions
};
