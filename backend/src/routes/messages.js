const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Patient = require('../models/Patient');
const { auth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  const messages = await Message.find()
    .sort({ createdAt: -1 })
    .populate('patientId', 'firstName lastName phone email');

  res.json({
    success: true,
    data: messages
  });
}));

router.post('/', asyncHandler(async (req, res, next) => {
  const { patientId, message, type, status, channel } = req.body;

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  const newMessage = await Message.create({
    patientId,
    message,
    type,
    status: status || 'sent',
    channel,
    sentAt: new Date()
  });

  await newMessage.populate('patientId', 'firstName lastName phone email');

  res.status(201).json({
    success: true,
    data: newMessage
  });
}));

router.delete('/:id', asyncHandler(async (req, res, next) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
}));

module.exports = router;
