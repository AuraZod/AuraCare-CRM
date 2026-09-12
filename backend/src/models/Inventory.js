const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required'],
    trim: true,
    maxlength: 100
  },
  manufacturingDate: {
    type: Date,
    required: [true, 'Manufacturing date is required']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: 0
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: false
  },
  receivedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'recalled', 'damaged'],
    default: 'active'
  }
}, { timestamps: true });

const inventorySchema = new mongoose.Schema({
  itemCode: {
    type: String,
    required: [true, 'Item code is required'],
    unique: true,
    trim: true,
    maxlength: 50
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: 200
  },
  genericName: {
    type: String,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['medicine', 'surgical', 'consumable', 'equipment', 'other'],
    lowercase: true
  },
  subCategory: {
    type: String,
    trim: true,
    maxlength: 100
  },
  manufacturer: {
    type: String,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['tablet', 'capsule', 'bottle', 'vial', 'tube', 'box', 'piece', 'ml', 'mg', 'gm', 'kg', 'other'],
    lowercase: true
  },
  strength: {
    type: String,
    trim: true,
    maxlength: 100
  },
  form: {
    type: String,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'powder', 'other'],
    lowercase: true
  },
  batches: [batchSchema],
  reorderLevel: {
    type: Number,
    required: [true, 'Reorder level is required'],
    min: 0,
    default: 10
  },
  maxStockLevel: {
    type: Number,
    min: 0
  },
  location: {
    rack: String,
    shelf: String,
    bin: String
  },
  storageConditions: {
    type: String,
    enum: ['room_temperature', 'refrigerated', 'frozen', 'controlled_room_temperature'],
    default: 'room_temperature'
  },
  prescriptionRequired: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

inventorySchema.index({ itemCode: 1 });
inventorySchema.index({ name: 1 });
inventorySchema.index({ category: 1, subCategory: 1 });
inventorySchema.index({ 'batches.expiryDate': 1 });
inventorySchema.index({ isActive: 1 });

inventorySchema.virtual('totalQuantity').get(function() {
  return this.batches
    .filter(batch => batch.status === 'active')
    .reduce((total, batch) => total + batch.quantity, 0);
});

inventorySchema.virtual('availableQuantity').get(function() {
  const now = new Date();
  return this.batches
    .filter(batch => batch.status === 'active' && batch.expiryDate > now)
    .reduce((total, batch) => total + batch.quantity, 0);
});

inventorySchema.virtual('expiredQuantity').get(function() {
  const now = new Date();
  return this.batches
    .filter(batch => batch.expiryDate <= now)
    .reduce((total, batch) => total + batch.quantity, 0);
});

inventorySchema.virtual('isLowStock').get(function() {
  return this.availableQuantity <= this.reorderLevel;
});

inventorySchema.virtual('expiringSoon').get(function() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  return this.batches.filter(batch =>
    batch.status === 'active' &&
    batch.expiryDate <= thirtyDaysFromNow &&
    batch.expiryDate > new Date()
  );
});

inventorySchema.methods.getCurrentSellingPrice = function() {
  const activeBatches = this.batches
    .filter(batch => batch.status === 'active' && batch.quantity > 0)
    .sort((a, b) => a.expiryDate - b.expiryDate);

  return activeBatches.length > 0 ? activeBatches[0].sellingPrice : 0;
};

inventorySchema.methods.reduceStock = function(quantity) {
  let remainingQuantity = quantity;
  const activeBatches = this.batches
    .filter(batch => batch.status === 'active' && batch.quantity > 0)
    .sort((a, b) => a.expiryDate - b.expiryDate);

  for (const batch of activeBatches) {
    if (remainingQuantity <= 0) break;

    const deductQuantity = Math.min(batch.quantity, remainingQuantity);
    batch.quantity -= deductQuantity;
    remainingQuantity -= deductQuantity;
  }

  return remainingQuantity === 0;
};

inventorySchema.methods.addStock = function(batchData) {
  this.batches.push(batchData);
  return this.save();
};

inventorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
