const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getPatients = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search;

  let query = { isActive: true };

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const patients = await Patient.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email');

  const total = await Patient.countDocuments(query);

  res.json({
    success: true,
    data: patients,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

const getPatientById = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id)
    .populate('createdBy', 'name email');

  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  res.json({
    success: true,
    data: patient,
  });
});

const createPatient = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    yearOfBirth,
    gender,
    phone,
    email,
    address,
    emergencyContact,
    bloodGroup,
    allergies,
    chronicConditions,
    currentMedications,
    medicalHistory: medicalHistoryText,
    insurance,
    occupation,
    maritalStatus,
    notes
  } = req.body;

  let finalDateOfBirth = dateOfBirth;
  if (yearOfBirth && !dateOfBirth) {

    finalDateOfBirth = `${yearOfBirth}-01-01`;
  }

  const patientData = {
    firstName,
    lastName,
    dateOfBirth: finalDateOfBirth,
    gender: gender?.toLowerCase(),
    phone,
    email,
    address,
    emergencyContact: (emergencyContact && (emergencyContact.name || emergencyContact.phone)) ? {
      ...emergencyContact,
      relationship: emergencyContact.relationship?.toLowerCase()
    } : undefined,
    bloodGroup,
    allergies: allergies || [],
    occupation,
    maritalStatus: maritalStatus?.toLowerCase(),
    notes,
    createdBy: req.user.id
  };

  if (chronicConditions?.length || currentMedications?.length || medicalHistoryText || insurance) {
    patientData.medicalHistory = {};

    if (chronicConditions?.length) {
      patientData.medicalHistory.conditions = chronicConditions.map(condition => ({
        condition,
        status: 'active',
        severity: 'mild'
      }));
    }

    if (currentMedications?.length) {
      patientData.medicalHistory.medications = currentMedications.map(medication => ({
        name: medication,
        dosage: 'As prescribed',
        frequency: 'As prescribed',
        startDate: new Date(),
        status: 'active'
      }));
    }

    if (insurance?.provider || insurance?.policyNumber || insurance?.groupNumber) {
      patientData.medicalHistory.insurance = {
        provider: insurance.provider,
        policyNumber: insurance.policyNumber,
        groupNumber: insurance.groupNumber
      };
    }

    if (medicalHistoryText) {
      patientData.medicalHistory.generalNotes = medicalHistoryText;
    }
  }

  const patient = await Patient.create(patientData);

  res.status(201).json({
    success: true,
    data: patient,
    message: 'Patient registered successfully'
  });
});

const updatePatient = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  res.json({
    success: true,
    data: patient,
    message: 'Patient updated successfully'
  });
});

const deletePatient = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  res.json({
    success: true,
    message: 'Patient deactivated successfully'
  });
});

const searchPatients = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.json({
      success: true,
      data: []
    });
  }

  const patients = await Patient.find({
    isActive: true,
    $or: [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } }
    ]
  }).limit(10).select('firstName lastName phone email dateOfBirth gender');

  res.json({
    success: true,
    data: patients
  });
});

const addMedicalHistory = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  const { type, data } = req.body;

  switch (type) {
    case 'condition':
      patient.medicalHistory.conditions.push(data);
      break;
    case 'medication':
      patient.medicalHistory.medications.push(data);
      break;
    case 'surgery':
      patient.medicalHistory.surgeries.push(data);
      break;
    case 'immunization':
      patient.medicalHistory.immunizations.push(data);
      break;
    case 'familyHistory':
      patient.medicalHistory.familyHistory.push(data);
      break;
    case 'vitalSigns':
      data.recordedBy = req.user.id;
      patient.medicalHistory.vitalSigns.push(data);
      break;
    case 'labResult':
      patient.medicalHistory.labResults.push(data);
      break;
    default:
      return next(new AppError('Invalid medical history type', 400));
  }

  patient.medicalHistory.lastReviewDate = new Date();
  patient.medicalHistory.lastReviewedBy = req.user.id;

  await patient.save();

  res.json({
    success: true,
    data: patient,
    message: 'Medical history updated successfully'
  });
});

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  addMedicalHistory
};
