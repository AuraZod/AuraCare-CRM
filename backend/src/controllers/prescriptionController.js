const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getPrescriptions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { patientId, doctorId, status, hasFollowUp } = req.query;

  let query = { isActive: true };

  if (patientId) {
    query.patientId = patientId;
  }

  if (doctorId) {
    query.doctorId = doctorId;
  }

  if (req.user.role === 'doctor') {
    query.doctorId = req.user.id;
  }

  if (status) {
    query.status = status;
  }

  if (hasFollowUp === 'true') {
    query.followUpDate = { $exists: true, $ne: null };
  }

  const prescriptions = await Prescription.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate('patientId', 'firstName lastName phone email age gender')
    .populate('doctorId', 'name email profile.specialization')
    .populate('dispensedBy', 'name email');

  const total = await Prescription.countDocuments(query);

  res.json({
    success: true,
    data: prescriptions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

const getPrescriptionById = asyncHandler(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patientId')
    .populate('doctorId', 'name email profile.specialization')
    .populate('dispensedBy', 'name email')
    .populate('createdBy', 'name email');

  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }

  res.json({
    success: true,
    data: prescription,
  });
});

const createPrescription = asyncHandler(async (req, res, next) => {
  const { patientId, medications, diagnosis, symptoms, advice, followUpDate, followUpInstructions } = req.body;

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  const prescriptionData = {
    patientId,
    doctorId: req.user.id,
    medications,
    diagnosis,
    symptoms: symptoms || [],
    advice,
    followUpDate,
    followUpInstructions,
    createdBy: req.user.id
  };

  const prescription = await Prescription.create(prescriptionData);

  await prescription.populate([
    { path: 'patientId', select: 'firstName lastName phone email age gender' },
    { path: 'doctorId', select: 'name email profile.specialization' }
  ]);

  res.status(201).json({
    success: true,
    data: prescription,
    message: 'Prescription created successfully'
  });
});

const updatePrescription = asyncHandler(async (req, res, next) => {
  let prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }

  if (req.user.role === 'doctor' && prescription.doctorId.toString() !== req.user.id) {
    return next(new AppError('Not authorized to update this prescription', 403));
  }

  prescription = await Prescription.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate([
    { path: 'patientId', select: 'firstName lastName phone email age gender' },
    { path: 'doctorId', select: 'name email profile.specialization' }
  ]);

  res.json({
    success: true,
    data: prescription,
    message: 'Prescription updated successfully'
  });
});

const dispenseMedication = asyncHandler(async (req, res, next) => {
  const { medicationIndex, quantityDispensed, batchNumber, expiryDate } = req.body;

  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }

  if (medicationIndex >= prescription.medications.length) {
    return next(new AppError('Invalid medication index', 400));
  }

  prescription.dispensedMedications.push({
    medicationIndex,
    quantityDispensed,
    dispensedDate: new Date(),
    batchNumber,
    expiryDate
  });

  const totalMedications = prescription.medications.length;
  const dispensedMedicationsCount = prescription.dispensedMedications.length;

  if (dispensedMedicationsCount === totalMedications) {
    prescription.status = 'dispensed';
  } else {
    prescription.status = 'partially_dispensed';
  }

  prescription.dispensedBy = req.user.id;
  prescription.dispensedAt = new Date();

  await prescription.save();

  await prescription.populate([
    { path: 'patientId', select: 'firstName lastName phone email age gender' },
    { path: 'doctorId', select: 'name email profile.specialization' },
    { path: 'dispensedBy', select: 'name email' }
  ]);

  res.json({
    success: true,
    data: prescription,
    message: 'Medication dispensed successfully'
  });
});

const getPendingPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({
    status: { $in: ['active', 'partially_dispensed'] },
    isActive: true
  })
    .sort({ createdAt: -1 })
    .populate('patientId', 'firstName lastName phone email age gender')
    .populate('doctorId', 'name email profile.specialization');

  res.json({
    success: true,
    data: prescriptions
  });
});

const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const prescriptions = await Prescription.find({
    patientId,
    isActive: true
  })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate('doctorId', 'name email profile.specialization')
    .populate('dispensedBy', 'name email');

  const total = await Prescription.countDocuments({ patientId, isActive: true });

  res.json({
    success: true,
    data: prescriptions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

module.exports = {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  dispenseMedication,
  getPendingPrescriptions,
  getPatientPrescriptions
};
