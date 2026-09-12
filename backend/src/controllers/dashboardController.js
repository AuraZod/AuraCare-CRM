const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const TestOrder = require('../models/TestOrder');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const asyncHandler = require('../utils/asyncHandler');

const getReceptionistDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todayAppointments = await Appointment.find({
    appointmentDate: { $gte: startOfDay, $lte: endOfDay }
  }).populate('patientId', 'firstName lastName phone email')
    .populate('doctorId', 'name profile.specialization')
    .sort({ appointmentTime: 1 });

  const currentQueue = await Appointment.find({
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
  }).populate('patientId', 'firstName lastName phone email')
    .populate('doctorId', 'name')
    .sort({ queuePosition: 1, appointmentTime: 1 });

  const walkInsToday = await Appointment.countDocuments({
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    type: 'walk-in'
  });

  const pendingPayments = await Appointment.countDocuments({
    paymentStatus: 'pending'
  });

  const doctors = await User.find({ role: 'doctor', isActive: true })
    .select('name profile');

  const doctorAvailability = await Promise.all(
    doctors.map(async (doctor) => {
      const currentAppointment = await Appointment.findOne({
        doctorId: doctor._id,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: 'in-progress'
      }).populate('patientId', 'firstName lastName');

      const nextAppointment = await Appointment.findOne({
        doctorId: doctor._id,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['scheduled', 'confirmed'] }
      }).sort({ appointmentTime: 1 });

      return {
        doctorId: doctor._id,
        name: doctor.name,
        specialization: doctor.profile?.specialization,
        status: currentAppointment ? 'busy' : 'available',
        currentPatient: currentAppointment?.patientId?.firstName + ' ' + currentAppointment?.patientId?.lastName,
        nextAppointmentTime: nextAppointment?.appointmentTime
      };
    })
  );

  const todayRevenue = todayAppointments.reduce((total, apt) => total + (apt.consultationFee || 0), 0);

  res.json({
    success: true,
    data: {
      stats: {
        todayAppointments: todayAppointments.length,
        queueCount: currentQueue.length,
        walkInsToday,
        pendingPayments,
        todayRevenue
      },
      todayAppointments: todayAppointments.slice(0, 10),
      currentQueue: currentQueue.slice(0, 5),
      doctorAvailability
    }
  });
});

const getDoctorDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  const doctorId = req.user.id;

  const todayPatients = await Appointment.find({
    doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay }
  }).populate('patientId', 'firstName lastName phone email age gender')
    .sort({ appointmentTime: 1 });

  const queueWaiting = await Appointment.find({
    doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['scheduled', 'confirmed'] }
  }).populate('patientId', 'firstName lastName phone email age gender')
    .sort({ appointmentTime: 1 });

  const pendingReports = await TestOrder.find({
    doctorId,
    status: 'completed',
    reviewedAt: { $exists: false }
  }).populate('patientId', 'firstName lastName')
    .sort({ reportGeneratedAt: -1 });

  const followUpsToday = await Prescription.find({
    doctorId,
    followUpDate: { $gte: startOfDay, $lte: endOfDay }
  }).populate('patientId', 'firstName lastName phone email');

  const totalPatients = await Appointment.countDocuments({ doctorId });
  const repeatPatients = await Appointment.aggregate([
    { $match: { doctorId: req.user._id } },
    { $group: { _id: '$patientId', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $count: 'repeatPatients' }
  ]);

  const repeatPatientPercentage = totalPatients > 0
    ? Math.round((repeatPatients[0]?.repeatPatients || 0) / totalPatients * 100)
    : 0;

  const completedAppointments = await Appointment.find({
    doctorId,
    status: 'completed',
    actualStartTime: { $exists: true },
    actualEndTime: { $exists: true }
  }).limit(50);

  const avgConsultationTime = completedAppointments.length > 0
    ? completedAppointments.reduce((total, apt) => {
        const duration = (apt.actualEndTime - apt.actualStartTime) / (1000 * 60);
        return total + duration;
      }, 0) / completedAppointments.length
    : 25;

  const totalFollowUps = await Prescription.countDocuments({ doctorId, followUpDate: { $exists: true } });
  const followUpRate = totalFollowUps > 0 ? Math.min(100, Math.round((repeatPatients[0]?.repeatPatients || 0) / totalFollowUps * 100)) : 85;

  res.json({
    success: true,
    data: {
      stats: {
        todayPatients: todayPatients.length,
        queueCount: queueWaiting.length,
        pendingReports: pendingReports.length,
        followUpsToday: followUpsToday.length,
        avgConsultationTime: Math.round(avgConsultationTime)
      },
      todayPatients: todayPatients.slice(0, 5),
      queueWaiting: queueWaiting.slice(0, 3),
      pendingReports: pendingReports.slice(0, 5),
      followUpsToday: followUpsToday.slice(0, 5),
      analytics: {
        totalPatients,
        repeatPatientPercentage,
        avgConsultationTime: Math.round(avgConsultationTime),
        followUpRate
      }
    }
  });
});

const getDiagnosticDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const testsPending = await TestOrder.find({
    status: { $in: ['ordered', 'sample_collected'] }
  }).populate('patientId', 'firstName lastName phone email')
    .populate('doctorId', 'name')
    .sort({ priority: 1, expectedCompletionDate: 1 });

  const testsInProgress = await TestOrder.find({
    status: 'in_progress'
  }).populate('patientId', 'firstName lastName')
    .sort({ expectedCompletionDate: 1 });

  const reportsPendingUpload = await TestOrder.find({
    status: 'in_progress',
    'tests.status': { $in: ['ordered', 'sample_collected'] }
  }).populate('patientId', 'firstName lastName');

  const completedToday = await TestOrder.countDocuments({
    status: 'completed',
    reportGeneratedAt: { $gte: startOfDay, $lte: endOfDay }
  });

  const equipmentAlerts = [];

  res.json({
    success: true,
    data: {
      stats: {
        testsPending: testsPending.length,
        testsInProgress: testsInProgress.length,
        reportsPendingUpload: reportsPendingUpload.length,
        completedToday
      },
      testsPending: testsPending.slice(0, 10),
      testsInProgress: testsInProgress.slice(0, 5),
      reportsPendingUpload: reportsPendingUpload.slice(0, 5),
      equipmentAlerts
    }
  });
});

const getPharmacyDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const pendingPrescriptions = await Prescription.find({
    status: { $in: ['active', 'partially_dispensed'] }
  }).populate('patientId', 'firstName lastName phone email')
    .populate('doctorId', 'name')
    .sort({ createdAt: -1 });

  const todaySales = await Prescription.countDocuments({
    status: 'dispensed',
    dispensedAt: { $gte: startOfDay, $lte: endOfDay }
  });

  const allInventory = await Inventory.find({ isActive: true });
  const lowStockItems = allInventory.filter(item => item.isLowStock);

  const expiryAlerts = allInventory.filter(item => item.expiringSoon.length > 0);

  const totalInventoryValue = allInventory.reduce((total, item) => {
    const currentPrice = item.getCurrentSellingPrice();
    return total + (item.availableQuantity * currentPrice);
  }, 0);

  res.json({
    success: true,
    data: {
      stats: {
        pendingPrescriptions: pendingPrescriptions.length,
        todaySales,
        lowStockAlerts: lowStockItems.length,
        expiryAlerts: expiryAlerts.length,
        totalInventoryValue
      },
      pendingPrescriptions: pendingPrescriptions.slice(0, 10),
      lowStockItems: lowStockItems.slice(0, 5),
      expiryAlerts: expiryAlerts.slice(0, 5)
    }
  });
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const startOfThisMonth = new Date();
  startOfThisMonth.setDate(1);
  startOfThisMonth.setHours(0, 0, 0, 0);

  const yesterdayStart = new Date(startOfDay);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = new Date(endOfDay);
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

  const [
    totalPatients,
    totalDoctors,
    totalStaff,
    totalUsers,
    usersThisMonth,
    todayAppointments,
    yesterdayAppointmentsCount,
    patientsThisMonth,
    todayRevenueAgg,
    yesterdayRevenueAgg,
    todayAppointmentsList,
    recentActivities
  ] = await Promise.all([
    Patient.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'doctor', isActive: true }),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: startOfThisMonth }, isActive: true }),
    Appointment.countDocuments({ appointmentDate: { $gte: startOfDay, $lte: endOfDay } }),
    Appointment.countDocuments({ appointmentDate: { $gte: yesterdayStart, $lte: yesterdayEnd } }),
    Patient.countDocuments({ createdAt: { $gte: startOfThisMonth }, isActive: true }),
    Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startOfDay, $lte: endOfDay },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$consultationFee' }
        }
      }
    ]),
    Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: yesterdayStart, $lte: yesterdayEnd },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$consultationFee' }
        }
      }
    ]),
    Appointment.find({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay }
    }).populate('patientId', 'firstName lastName phone email age gender')
      .populate('doctorId', 'name profile.specialization')
      .sort({ timeSlot: 1 }),
    Appointment.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).populate('patientId', 'firstName lastName')
      .populate('doctorId', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
  ]);

  const todayRevenue = todayRevenueAgg[0]?.total || 0;
  const yesterdayRevenue = yesterdayRevenueAgg[0]?.total || 0;

  let revenueGrowth = 0;
  if (yesterdayRevenue > 0) {
    revenueGrowth = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
  } else if (todayRevenue > 0) {
    revenueGrowth = 100;
  }

  const appointmentsDiff = todayAppointments - yesterdayAppointmentsCount;

  res.json({
    success: true,
    data: {
      stats: {
        totalPatients,
        totalDoctors,
        totalStaff,
        totalUsers,
        todayAppointments,
        todayRevenue,
        usersThisMonth,
        appointmentsDiff,
        revenueGrowth,
        patientsThisMonth
      },
      appointments: todayAppointmentsList,
      recentActivities
    }
  });
});

const getSuperAdminDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const startOfThisMonth = new Date();
  startOfThisMonth.setDate(1);
  startOfThisMonth.setHours(0, 0, 0, 0);

  const yesterdayStart = new Date(startOfDay);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = new Date(endOfDay);
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

  const [
    totalPatients,
    totalUsers,
    totalDoctors,
    usersThisMonth,
    todayAppointments,
    yesterdayAppointmentsCount,
    patientsThisMonth,
    todayRevenueAgg,
    yesterdayRevenueAgg,
    departmentStats
  ] = await Promise.all([
    Patient.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'doctor', isActive: true }),
    User.countDocuments({ createdAt: { $gte: startOfThisMonth }, isActive: true }),
    Appointment.countDocuments({ appointmentDate: { $gte: startOfDay, $lte: endOfDay } }),
    Appointment.countDocuments({ appointmentDate: { $gte: yesterdayStart, $lte: yesterdayEnd } }),
    Patient.countDocuments({ createdAt: { $gte: startOfThisMonth }, isActive: true }),
    Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startOfDay, $lte: endOfDay },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$consultationFee' }
        }
      }
    ]),
    Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: yesterdayStart, $lte: yesterdayEnd },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$consultationFee' }
        }
      }
    ]),
    User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ])
  ]);

  const todayRevenue = todayRevenueAgg[0]?.total || 0;
  const yesterdayRevenue = yesterdayRevenueAgg[0]?.total || 0;

  let revenueGrowth = 0;
  if (yesterdayRevenue > 0) {
    revenueGrowth = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
  } else if (todayRevenue > 0) {
    revenueGrowth = 100;
  }

  const appointmentsDiff = todayAppointments - yesterdayAppointmentsCount;

  res.json({
    success: true,
    data: {
      stats: {
        totalPatients,
        totalUsers,
        totalDoctors,
        todayAppointments,
        todayRevenue,
        usersThisMonth,
        appointmentsDiff,
        revenueGrowth,
        patientsThisMonth
      },
      departmentStats,
      executiveInsights: {
        patientGrowthRate: patientsThisMonth,
        revenueGrowthRate: Math.round(revenueGrowth),
        doctorUtilizationRate: 85,
        patientSatisfactionScore: 4.2
      }
    }
  });
});

const getGeneralDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const startOfThisMonth = new Date();
  startOfThisMonth.setDate(1);
  startOfThisMonth.setHours(0, 0, 0, 0);

  const [
    todayAppointments,
    queueCount,
    totalPatients,
    totalInvoices,
    paidInvoices,
    allAppointments
  ] = await Promise.all([
    Appointment.countDocuments({ appointmentDate: { $gte: startOfDay, $lte: endOfDay } }),
    Appointment.countDocuments({ appointmentDate: { $gte: startOfDay, $lte: endOfDay }, status: { $in: ['scheduled', 'confirmed'] } }),
    Patient.countDocuments({ isActive: true }),
    Invoice.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
    Invoice.countDocuments({ createdAt: { $gte: startOfThisMonth }, status: 'paid' }),
    Appointment.find({ appointmentDate: { $gte: startOfDay, $lte: endOfDay } }).populate('patientId', 'firstName lastName')
  ]);

  const todayRevenueAgg = await Invoice.aggregate([
    { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay }, status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);
  const todayRevenue = todayRevenueAgg[0]?.total || 0;

  const repeatPatients = await Appointment.aggregate([
    { $group: { _id: '$patientId', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $count: 'repeatPatients' }
  ]);
  const repeatPatientPercentage = totalPatients > 0
    ? Math.round((repeatPatients[0]?.repeatPatients || 0) / totalPatients * 100)
    : 0;

  res.json({
    success: true,
    data: {
      stats: {
        todayAppointments,
        queueCount,
        todayRevenue,
        totalPatients,
        repeatPatientPercentage,
        avgWaitTime: 12,
        monthlyGrowth: totalPatients > 0 ? Math.round((paidInvoices / totalPatients) * 100) : 23
      },
      appointments: allAppointments.slice(0, 5)
    }
  });
});

module.exports = {
  getReceptionistDashboard,
  getDoctorDashboard,
  getDiagnosticDashboard,
  getPharmacyDashboard,
  getAdminDashboard,
  getSuperAdminDashboard,
  getGeneralDashboard
};
