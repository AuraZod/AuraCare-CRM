const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Backup name is required'],
    trim: true
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['auto', 'manual'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'failed'],
    default: 'in_progress'
  },
  size: {
    type: Number,
    default: 0
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  metadata: {
    collections: [{
      name: String,
      count: Number,
      size: Number
    }],
    totalRecords: {
      type: Number,
      default: 0
    },
    compressionRatio: {
      type: Number,
      default: 1
    },
    checksum: String
  },
  error: {
    type: String,
    trim: true
  },
  completedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

backupSchema.index({ type: 1, createdAt: -1 });
backupSchema.index({ status: 1, createdAt: -1 });
backupSchema.index({ createdBy: 1, createdAt: -1 });
backupSchema.index({ expiresAt: 1 });

backupSchema.virtual('formattedSize').get(function() {
  if (this.size === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(this.size) / Math.log(1024));
  return `${(this.size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
});

backupSchema.methods.markCompleted = function(size, metadata = {}) {
  this.status = 'completed';
  this.size = size;
  this.metadata = { ...this.metadata, ...metadata };
  this.completedAt = new Date();
  return this.save();
};

backupSchema.methods.markFailed = function(error) {
  this.status = 'failed';
  this.error = error;
  this.completedAt = new Date();
  return this.save();
};

backupSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  return result;
};

module.exports = mongoose.model('Backup', backupSchema);
