const mongoose = require('mongoose');

const maintenanceHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['scheduled', 'repair', 'calibration', 'inspection'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cost: {
    type: Number,
    default: 0,
    min: 0
  },
  nextMaintenanceDate: Date,
  notes: String
});

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Imaging', 'Laboratory', 'Cardiology', 'Surgery', 'General', 'Diagnostic', 'Therapy']
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['operational', 'maintenance', 'out-of-order', 'calibration', 'retired'],
    default: 'operational'
  },
  purchaseDate: {
    type: Date
  },
  warrantyExpiry: {
    type: Date
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  },
  nextMaintenance: {
    type: Date,
    required: true
  },
  usageHours: {
    type: Number,
    default: 0,
    min: 0
  },
  maxUsageHours: {
    type: Number,
    default: 8760
  },
  maintenanceInterval: {
    type: Number,
    default: 90,
    min: 1
  },
  notes: {
    type: String,
    trim: true
  },
  specifications: {
    type: Map,
    of: String
  },
  maintenanceHistory: [maintenanceHistorySchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

equipmentSchema.index({ type: 1, status: 1 });
equipmentSchema.index({ location: 1 });
equipmentSchema.index({ serialNumber: 1 });
equipmentSchema.index({ nextMaintenance: 1 });
equipmentSchema.index({ status: 1, createdAt: -1 });

equipmentSchema.virtual('maintenanceStatus').get(function() {
  const now = new Date();
  const daysDiff = Math.ceil((this.nextMaintenance - now) / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) return 'overdue';
  if (daysDiff <= 7) return 'due_soon';
  return 'scheduled';
});

equipmentSchema.virtual('usagePercentage').get(function() {
  return this.maxUsageHours > 0 ? ((this.usageHours / this.maxUsageHours) * 100).toFixed(2) : 0;
});

equipmentSchema.virtual('warrantyStatus').get(function() {
  if (!this.warrantyExpiry) return 'unknown';
  const now = new Date();
  return this.warrantyExpiry > now ? 'active' : 'expired';
});

equipmentSchema.set('toJSON', { virtuals: true });
equipmentSchema.set('toObject', { virtuals: true });

equipmentSchema.pre('save', function(next) {
  if (this.isModified('lastMaintenance') && this.lastMaintenance) {
    this.nextMaintenance = new Date(this.lastMaintenance.getTime() + (this.maintenanceInterval * 24 * 60 * 60 * 1000));
  }
  next();
});

module.exports = mongoose.model('Equipment', equipmentSchema);
