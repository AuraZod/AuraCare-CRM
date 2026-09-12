const TestOrder = require('../models/TestOrder');
const Patient = require('../models/Patient');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const path = require('path');
const fs = require('fs');

const getTestOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { patientId, doctorId, status, priority } = req.query;

  let query = { isActive: true };

  if (patientId) query.patientId = patientId;
  if (doctorId) query.doctorId = doctorId;
  if (req.user.role === 'doctor') query.doctorId = req.user.id;
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const testOrders = await TestOrder.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate('patientId', 'firstName lastName phone email age gender')
    .populate('doctorId', 'name email profile.specialization')
    .populate('sampleCollectedBy', 'name email')
    .populate('reportGeneratedBy', 'name email');

  const total = await TestOrder.countDocuments(query);

  res.json({
    success: true,
    data: testOrders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const getTestOrderById = asyncHandler(async (req, res, next) => {
  const testOrder = await TestOrder.findById(req.params.id)
    .populate('patientId')
    .populate('doctorId', 'name email profile.specialization')
    .populate('sampleCollectedBy', 'name email')
    .populate('reportGeneratedBy', 'name email')
    .populate('reviewedBy', 'name email')
    .populate('createdBy', 'name email');

  if (!testOrder) {
    return next(new AppError('Test order not found', 404));
  }

  res.json({ success: true, data: testOrder });
});

const createTestOrder = asyncHandler(async (req, res, next) => {
  const { patientId, tests, priority, clinicalHistory, provisionalDiagnosis, specialInstructions, appointmentId } = req.body;

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  const expectedCompletionDate = new Date();
  switch (priority) {
    case 'stat': expectedCompletionDate.setHours(expectedCompletionDate.getHours() + 2); break;
    case 'urgent': expectedCompletionDate.setDate(expectedCompletionDate.getDate() + 1); break;
    default: expectedCompletionDate.setDate(expectedCompletionDate.getDate() + 3);
  }

  const testOrder = await TestOrder.create({
    patientId,
    doctorId: req.user.id,
    appointmentId,
    tests,
    priority: priority || 'routine',
    clinicalHistory,
    provisionalDiagnosis,
    specialInstructions,
    expectedCompletionDate,
    createdBy: req.user.id
  });

  await testOrder.populate([
    { path: 'patientId', select: 'firstName lastName phone email age gender' },
    { path: 'doctorId', select: 'name email profile.specialization' }
  ]);

  res.status(201).json({ success: true, data: testOrder, message: 'Test order created successfully' });
});

const updateTestOrder = asyncHandler(async (req, res, next) => {
  const testOrder = await TestOrder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate([
      { path: 'patientId', select: 'firstName lastName phone email age gender' },
      { path: 'doctorId', select: 'name email profile.specialization' }
    ]);

  if (!testOrder) {
    return next(new AppError('Test order not found', 404));
  }

  res.json({ success: true, data: testOrder, message: 'Test order updated successfully' });
});

const updateSampleCollection = asyncHandler(async (req, res, next) => {
  const testOrder = await TestOrder.findByIdAndUpdate(
    req.params.id,
    { status: 'sample_collected', sampleCollectionDate: new Date(), sampleCollectedBy: req.user.id },
    { new: true }
  ).populate([
    { path: 'patientId', select: 'firstName lastName phone email age gender' },
    { path: 'doctorId', select: 'name email profile.specialization' },
    { path: 'sampleCollectedBy', select: 'name email' }
  ]);

  if (!testOrder) {
    return next(new AppError('Test order not found', 404));
  }

  res.json({ success: true, data: testOrder, message: 'Sample collection status updated successfully' });
});

const updateTestResults = asyncHandler(async (req, res, next) => {
  const { testIndex, result, resultValue, resultStatus, reportUrl } = req.body;

  const testOrder = await TestOrder.findById(req.params.id);
  if (!testOrder) return next(new AppError('Test order not found', 404));
  if (testIndex >= testOrder.tests.length) return next(new AppError('Invalid test index', 400));

  testOrder.tests[testIndex].result = result;
  testOrder.tests[testIndex].resultValue = resultValue;
  testOrder.tests[testIndex].resultStatus = resultStatus;
  testOrder.tests[testIndex].reportUrl = reportUrl;
  testOrder.tests[testIndex].status = 'completed';
  testOrder.tests[testIndex].completedAt = new Date();
  testOrder.tests[testIndex].technician = req.user.id;

  if (testOrder.areAllTestsCompleted()) {
    testOrder.status = 'completed';
    testOrder.reportGeneratedAt = new Date();
    testOrder.reportGeneratedBy = req.user.id;
  } else {
    testOrder.status = 'in_progress';
  }

  await testOrder.save();
  await testOrder.populate([
    { path: 'patientId', select: 'firstName lastName phone email age gender' },
    { path: 'doctorId', select: 'name email profile.specialization' },
    { path: 'reportGeneratedBy', select: 'name email' }
  ]);

  res.json({ success: true, data: testOrder, message: 'Test results updated successfully' });
});

const getPendingTestOrders = asyncHandler(async (req, res) => {
  const testOrders = await TestOrder.find({
    status: { $in: ['ordered', 'sample_collected', 'in_progress'] },
    isActive: true
  })
    .sort({ priority: 1, expectedCompletionDate: 1 })
    .populate('patientId', 'firstName lastName phone email age gender')
    .populate('doctorId', 'name email profile.specialization');

  res.json({ success: true, data: testOrders });
});

const getCompletedTestOrders = asyncHandler(async (req, res) => {
  let query = { status: 'completed', isActive: true };
  if (req.user.role === 'doctor') query.doctorId = req.user.id;

  const testOrders = await TestOrder.find(query)
    .sort({ reportGeneratedAt: -1 })
    .populate('patientId', 'firstName lastName phone email age gender')
    .populate('doctorId', 'name email profile.specialization')
    .populate('reportGeneratedBy', 'name email');

  res.json({ success: true, data: testOrders });
});

const markAsReviewed = asyncHandler(async (req, res, next) => {
  const testOrder = await TestOrder.findByIdAndUpdate(
    req.params.id,
    { status: 'reported', reviewedBy: req.user.id, reviewedAt: new Date(), notes: req.body.notes },
    { new: true }
  ).populate([
    { path: 'patientId', select: 'firstName lastName phone email age gender' },
    { path: 'doctorId', select: 'name email profile.specialization' },
    { path: 'reviewedBy', select: 'name email' }
  ]);

  if (!testOrder) return next(new AppError('Test order not found', 404));

  res.json({ success: true, data: testOrder, message: 'Test order marked as reviewed' });
});

const uploadTestReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { notes } = req.body;

  const testOrder = await TestOrder.findById(id);
  if (!testOrder) return next(new AppError('Test order not found', 404));

  if (!['diagnostic', 'lab_technician', 'doctor', 'admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Not authorized to upload test reports', 403));
  }

  if (!req.file) return next(new AppError('Please upload a report file', 400));

  testOrder.reportFile = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype,
    uploadedAt: new Date(),
    uploadedBy: req.user.id
  };

  testOrder.reportNotes = notes;
  testOrder.status = 'reported';
  testOrder.reportGeneratedBy = req.user.id;
  testOrder.reportGeneratedAt = new Date();

  await testOrder.save();
  await testOrder.populate('patientId', 'firstName lastName phone email');
  await testOrder.populate('doctorId', 'name email');
  await testOrder.populate('reportGeneratedBy', 'name email');

  res.status(200).json({ success: true, message: 'Test report uploaded successfully', data: testOrder });
});

const downloadTestReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const testOrder = await TestOrder.findById(id);
  if (!testOrder) return next(new AppError('Test order not found', 404));

  if (!testOrder.reportFile || !testOrder.reportFile.path) {
    return next(new AppError('No report file found for this test order', 404));
  }

  const filePath = path.resolve(testOrder.reportFile.path);

  if (!fs.existsSync(filePath)) {
    return next(new AppError('Report file not found on server', 404));
  }

  res.download(filePath, testOrder.reportFile.originalName, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      return next(new AppError('Error downloading report file', 500));
    }
  });
});

const getTestReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const testOrder = await TestOrder.findById(id)
    .populate('patientId', 'firstName lastName phone email age gender')
    .populate('doctorId', 'name email profile.specialization')
    .populate('reportGeneratedBy', 'name email');

  if (!testOrder) return next(new AppError('Test order not found', 404));

  res.status(200).json({
    success: true,
    data: {
      testOrder,
      reportAvailable: !!testOrder.reportFile,
      reportFile: testOrder.reportFile ? {
        filename: testOrder.reportFile.filename,
        originalName: testOrder.reportFile.originalName,
        size: testOrder.reportFile.size,
        uploadedAt: testOrder.reportFile.uploadedAt
      } : null
    }
  });
});

module.exports = {
  getTestOrders,
  getTestOrderById,
  createTestOrder,
  updateTestOrder,
  updateSampleCollection,
  updateTestResults,
  getPendingTestOrders,
  getCompletedTestOrders,
  markAsReviewed,
  uploadTestReport,
  downloadTestReport,
  getTestReport
};
