const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['appointment', 'prescription', 'reminder', 'general'],
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  channel: {
    type: String,
    enum: ['whatsapp', 'sms'],
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

messageSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
