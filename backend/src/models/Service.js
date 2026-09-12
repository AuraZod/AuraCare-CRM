const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['consultation', 'lab_test', 'imaging', 'diagnostic', 'pharmacy', 'procedure', 'other']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  duration: {
    type: Number,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    unique: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  taxable: {
    type: Boolean,
    default: false
  },
  taxRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

serviceSchema.pre('save', async function(next) {
  if (!this.code) {
    const prefix = this.category.substring(0, 3).toUpperCase();
    const count = await mongoose.model('Service').countDocuments({ category: this.category });
    this.code = `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
