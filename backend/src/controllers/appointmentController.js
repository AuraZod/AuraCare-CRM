const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getAppointments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { date, doctorId, status } = req.query;

  let query = {};

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    query.appointmentDate = { $gte: startDate, $lt: endDate };
  }

  if (doctorId) {
    query.doctorId = doctorId;
  }

  if (status) {
    query.status = status;
  }

  const appointments = await Appointment.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ appointmentDate: 1, appointmentTime: 1 })
    .populate('patientId', 'firstName lastName phone email age gender')
    .populate('doctorId', 'name email profile.specialization')
    .populate('createdBy', 'name email');

  const total = await Appointment.countDocuments(query);

  res.json({
    success: true,
    data: appointments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

const getTodayAppointments = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  let query = {
    appointmentDate: { $gte: startOfDay, $lte: endOfDay }
  };

  if (req.user.role === 'doctor') {
    query.doctorId = req.user.id;
  }

  const appointments = await Appointment.find(query)
    .sort({ appointmentTime: 1 })
    .populate('patientId', 'firstName lastName phone email age gender')
    .populate('doctorId', 'name email profile.specialization');

  res.json({
    success: true,
    data: appointments
  });
});

const getAppointmentById = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patientId')
    .populate('doctorId', 'name email profile.specialization')
    .populate('createdBy', 'name email');

  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }

  res.json({
    success: true,
    data: appointment,
  });
});

const createAppointment = asyncHandler(async (req, res, next) => {
  const { patientId, doctorId, appointmentDate, appointmentTime, reason, type } = req.body;

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'doctor') {
    return next(new AppError('Doctor not found', 404));
  }

  const Settings = require('../models/Settings');
  const hospitalSettings = await Settings.findOne({ type: 'hospital' });
  const appointmentSystemType = hospitalSettings?.appointmentSystemType || 'time-limited';
  const maxAppointmentsPerSlot = hospitalSettings?.maxAppointmentsPerSlot || 1;

  if (appointmentSystemType === 'time-limited') {
    const existingAppointments = await Appointment.countDocuments({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
    });

    if (existingAppointments >= maxAppointmentsPerSlot) {
      return next(new AppError(`Doctor is not available at this time. Maximum ${maxAppointmentsPerSlot} appointment(s) per slot allowed.`, 409));
    }
  }

  let tokenNumber = null;
  if (type === 'walk-in') {
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: new Date(appointmentDate),
      type: 'walk-in'
    });
    tokenNumber = `W${String(todayAppointments + 1).padStart(3, '0')}`;
  }

  const appointmentData = {
    patientId,
    doctorId,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    reason,
    type: type || 'consultation',
    tokenNumber,
    createdBy: req.user.id
  };

  const appointment = await Appointment.create(appointmentData);

  await appointment.populate([
    { path: 'patientId', select: 'firstName lastName phone email age gender' },
    { path: 'doctorId', select: 'name email profile.specialization' }
  ]);

  res.status(201).json({
    success: true,
    data: appointment,
    message: 'Appointment created successfully'
  });
});

const updateAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedBy: req.user.id },
    { new: true, runValidators: true }
  ).populate([
    { path: 'patientId', select: 'firstName lastName phone email age gender' },
    { path: 'doctorId', select: 'name email profile.specialization' }
  ]);

  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }

  res.json({
    success: true,
    data: appointment,
    message: 'Appointment updated successfully'
  });
});

const cancelAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    {
      status: 'cancelled',
      updatedBy: req.user.id,
      notes: req.body.reason || 'Cancelled by user'
    },
    { new: true }
  );

  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }

  res.json({
    success: true,
    data: appointment,
    message: 'Appointment cancelled successfully'
  });
});

const getQueue = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const queue = await Appointment.find({
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['scheduled', 'confirmed', 'waiting', 'called', 'in-progress'] }
  })
    .sort({ priority: -1, appointmentTime: 1 })
    .populate('patientId', 'firstName lastName phone email age gender')
    .populate('doctorId', 'name email profile.specialization');

  const queueWithWaitTime = queue.map(appointment => {
    const appointmentTime = new Date(`${appointment.appointmentDate.toDateString()} ${appointment.appointmentTime}`);
    const now = new Date();
    const waitingTime = Math.max(0, Math.floor((now - appointmentTime) / (1000 * 60)));

    return {
      ...appointment.toObject(),
      waitingTime,
      tokenNumber: appointment.tokenNumber || `T${String(appointment._id).slice(-3).toUpperCase()}`
    };
  });

  res.json({
    success: true,
    data: queueWithWaitTime
  });
});

const getDoctorQueue = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const queue = await Appointment.find({
    doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
  })
    .sort({ queuePosition: 1, appointmentTime: 1 })
    .populate('patientId', 'firstName lastName phone email age gender');

  res.json({
    success: true,
    data: queue
  });
});

const updateAppointmentStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const updateData = { status, updatedBy: req.user.id };

  if (status === 'in-progress') {
    updateData.actualStartTime = new Date();
  } else if (status === 'completed') {
    updateData.actualEndTime = new Date();
  }

  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate([
    { path: 'patientId', select: 'firstName lastName phone email age gender' },
    { path: 'doctorId', select: 'name email profile.specialization' }
  ]);

  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }

  res.json({
    success: true,
    data: appointment,
    message: `Appointment status updated to ${status}`
  });
});

const deleteAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }

  if (!['cancelled', 'no_show'].includes(appointment.status)) {
    return next(new AppError('Only cancelled or no-show appointments can be deleted', 400));
  }

  await Appointment.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Appointment deleted successfully - slot is now available'
  });
});

module.exports = {
  getAppointments,
  getTodayAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
  getQueue,
  getDoctorQueue,
  updateAppointmentStatus
};
