const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  token: {
    type: String,
    required: [true, 'Token is required'],
    unique: true
  },
  refreshToken: {
    type: String,
    required: [true, 'Refresh token is required'],
    unique: true
  },
  jti: {
    type: String,
    required: [true, 'JWT ID is required'],
    unique: true
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    index: { expireAfterSeconds: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },

  deviceInfo: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  sessionType: {
    type: String,
    enum: ['standard', 'extended', 'remember_me'],
    default: 'extended'
  },
  maxInactivityPeriod: {
    type: Number,
    default: 30 * 24 * 60 * 60 * 1000
  },
  autoExtend: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ jti: 1 });
sessionSchema.index({ expiresAt: 1 });
sessionSchema.index({ lastActivity: 1 });
sessionSchema.index({ sessionType: 1 });

sessionSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

sessionSchema.methods.isInactive = function() {
  const inactivityThreshold = new Date(Date.now() - this.maxInactivityPeriod);
  return this.lastActivity < inactivityThreshold;
};

sessionSchema.methods.extendSession = function(additionalTime = 30 * 24 * 60 * 60 * 1000) {
  if (this.autoExtend && this.isActive) {
    this.expiresAt = new Date(Date.now() + additionalTime);
    this.lastActivity = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

sessionSchema.methods.invalidate = function() {
  this.isActive = false;
  return this.save();
};

sessionSchema.methods.updateActivity = function(ipAddress, userAgent) {
  this.lastActivity = new Date();
  if (ipAddress) this.ipAddress = ipAddress;
  if (userAgent) this.userAgent = userAgent;

  if (this.autoExtend && this.sessionType === 'extended') {
    this.expiresAt = new Date(Date.now() + this.maxInactivityPeriod);
  }

  return this.save();
};

sessionSchema.statics.cleanupInactiveSessions = async function() {
  const inactiveThreshold = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));

  const result = await this.deleteMany({
    $or: [
      { isActive: false },
      { expiresAt: { $lt: new Date() } },
      {
        lastActivity: { $lt: inactiveThreshold },
        autoExtend: false
      }
    ]
  });

  return result;
};

module.exports = mongoose.model('Session', sessionSchema);
sessionSchema.methods.invalidate = function() {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('Session', sessionSchema);
