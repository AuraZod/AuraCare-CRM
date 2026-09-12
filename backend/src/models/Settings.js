const mongoose = require('mongoose');

const workingHoursSchema = new mongoose.Schema({
  open: String,
  close: String,
  isOpen: { type: Boolean, default: true }
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['hospital', 'notification', 'billing', 'general'],
    unique: true
  },

  name: String,
  tagline: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  website: String,
  logo: String,
  workingHours: {
    monday: workingHoursSchema,
    tuesday: workingHoursSchema,
    wednesday: workingHoursSchema,
    thursday: workingHoursSchema,
    friday: workingHoursSchema,
    saturday: workingHoursSchema,
    sunday: workingHoursSchema
  },
  departments: [String],
  appointmentSystemType: {
    type: String,
    enum: ['time-limited', 'unlimited'],
    default: 'time-limited'
  },
  appointmentDuration: { type: Number, default: 30 },
  maxAppointmentsPerSlot: { type: Number, default: 1 },
  enableOnlineBooking: { type: Boolean, default: true },
  enableSmsNotifications: { type: Boolean, default: true },
  enableEmailNotifications: { type: Boolean, default: true },

  customSettings: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
