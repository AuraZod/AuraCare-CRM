const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true,
    maxlength: 200
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true,
    maxlength: 100
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    trim: true,
    maxlength: 100
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true,
    maxlength: 100
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: 500
  },
  quantity: {
    type: Number,
    min: 1
  },
  refills: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  prescriptionNumber: {
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
  medications: [medicationSchema],
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true,
    maxlength: 1000
  },
  symptoms: [String],
  advice: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  followUpDate: {
    type: Date,
    required: false
  },
  followUpInstructions: {
    type: String,
    trim: true,
    maxlength: 500
  },
  followUpStatus: {
    type: String,
    enum: ['pending', 'sent', 'completed', 'cancelled'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['active', 'dispensed', 'partially_dispensed', 'expired', 'cancelled'],
    default: 'active'
  },
  dispensedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  dispensedAt: {
    type: Date,
    required: false
  },
  dispensedMedications: [{
    medicationIndex: Number,
    quantityDispensed: Number,
    dispensedDate: Date,
    batchNumber: String,
    expiryDate: Date
  }],
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

prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });
prescriptionSchema.index({ prescriptionNumber: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ followUpDate: 1 });

prescriptionSchema.pre('save', async function(next) {
  if (!this.prescriptionNumber) {
    const count = await this.constructor.countDocuments();
    this.prescriptionNumber = `RX${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

prescriptionSchema.virtual('totalMedications').get(function() {
  return this.medications.length;
});

prescriptionSchema.virtual('dispensedStatus').get(function() {
  if (this.dispensedMedications.length === 0) return 'not_dispensed';
  if (this.dispensedMedications.length === this.medications.length) return 'fully_dispensed';
  return 'partially_dispensed';
});

prescriptionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
