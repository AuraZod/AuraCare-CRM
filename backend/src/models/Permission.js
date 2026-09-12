const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    trim: true
  },
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    trim: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true
  },
  conditions: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

permissionSchema.index({ resource: 1, action: 1 });
permissionSchema.index({ name: 1 });

module.exports = mongoose.model('Permission', permissionSchema);
