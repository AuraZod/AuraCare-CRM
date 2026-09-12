const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required']
  },
  duration: {
    type: Number,
    default: 30
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'walk-in', 'online'],
    default: 'consultation'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal'
  },
  reason: {
    type: String,
    required: false
  },
  notes: {
    type: String
  },
  symptoms: [String],
  vitals: {
    bloodPressure: String,
    temperature: String,
    pulse: String,
    weight: String,
    height: String
  },
  diagnosis: String,
  prescription: String,
  followUpDate: Date,
  followUpNotes: String,
  tokenNumber: String,
  queuePosition: Number,
  estimatedWaitTime: Number,
  actualStartTime: Date,
  actualEndTime: Date,
  consultationFee: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'online', 'insurance']
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date,
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

appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });
appointmentSchema.index({ tokenNumber: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });

appointmentSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

appointmentSchema.methods.isToday = function() {
  const today = new Date();
  const appointmentDate = new Date(this.appointmentDate);
  return appointmentDate.toDateString() === today.toDateString();
};

appointmentSchema.methods.isOverdue = function() {
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  return appointmentDateTime < now && this.status === 'scheduled';
};

appointmentSchema.statics.getTodaysAppointments = function(doctorId) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  return this.find({
    doctorId: doctorId,
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).populate('patientId', 'name phone email age gender');
};

appointmentSchema.statics.getQueue = function(doctorId) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  return this.find({
    doctorId: doctorId,
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
  }).sort({ queuePosition: 1, appointmentTime: 1 })
    .populate('patientId', 'name phone email age gender');
};

module.exports = mongoose.model('Appointment', appointmentSchema);
