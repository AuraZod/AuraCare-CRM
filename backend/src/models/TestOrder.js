const mongoose = require('mongoose');

const testItemSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true,
    maxlength: 200
  },
  testCode: {
    type: String,
    required: [true, 'Test code is required'],
    trim: true,
    maxlength: 50
  },
  category: {
    type: String,
    required: [true, 'Test category is required'],
    enum: ['blood', 'urine', 'imaging', 'cardiac', 'pulmonary', 'pathology', 'other'],
    lowercase: true
  },
  price: {
    type: Number,
    required: [true, 'Test price is required'],
    min: 0
  },
  normalRange: {
    type: String,
    trim: true,
    maxlength: 200
  },
  unit: {
    type: String,
    trim: true,
    maxlength: 50
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled'],
    default: 'ordered'
  },
  result: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  resultValue: {
    type: String,
    trim: true,
    maxlength: 100
  },
  resultStatus: {
    type: String,
    enum: ['normal', 'abnormal', 'critical', 'pending'],
    default: 'pending'
  },
  reportUrl: {
    type: String,
    trim: true
  },
  completedAt: {
    type: Date
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: false });

const testOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required']
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false
  },
  tests: [testItemSchema],
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  },
  clinicalHistory: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  provisionalDiagnosis: {
    type: String,
    trim: true,
    maxlength: 500
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: 500
  },
  sampleCollectionDate: {
    type: Date
  },
  sampleCollectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expectedCompletionDate: {
    type: Date
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'cancelled'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled', 'reported'],
    default: 'ordered'
  },
  reportGeneratedAt: {
    type: Date
  },
  reportGeneratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportFile: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedAt: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  reportNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

testOrderSchema.index({ patientId: 1, createdAt: -1 });
testOrderSchema.index({ doctorId: 1, createdAt: -1 });
testOrderSchema.index({ orderNumber: 1 });
testOrderSchema.index({ status: 1 });
testOrderSchema.index({ priority: 1 });
testOrderSchema.index({ expectedCompletionDate: 1 });

testOrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `TO${String(count + 1).padStart(6, '0')}`;
  }

  if (this.tests && this.tests.length > 0) {
    this.totalAmount = this.tests.reduce((total, test) => total + test.price, 0);
  }

  next();
});

testOrderSchema.virtual('completedTestsCount').get(function() {
  return this.tests.filter(test => test.status === 'completed').length;
});

testOrderSchema.virtual('pendingTestsCount').get(function() {
  return this.tests.filter(test => test.status !== 'completed' && test.status !== 'cancelled').length;
});

testOrderSchema.methods.areAllTestsCompleted = function() {
  return this.tests.every(test => test.status === 'completed' || test.status === 'cancelled');
};

testOrderSchema.methods.getCriticalResults = function() {
  return this.tests.filter(test => test.resultStatus === 'critical');
};

testOrderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('TestOrder', testOrderSchema);
