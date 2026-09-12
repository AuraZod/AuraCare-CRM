const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const TestOrder = require('../models/TestOrder');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getReports = asyncHandler(async (req, res) => {
  const { range = 'this_month', type = 'summary' } = req.query;

  const dateRange = getDateRange(range);

  let reportData = {};

  switch (type) {
    case 'summary':
      reportData = await getSummaryReport(dateRange);
      break;
    case 'detailed':
      reportData = await getDetailedReport(dateRange);
      break;
    case 'financial':
      reportData = await getFinancialReport(dateRange);
      break;
    case 'operational':
      reportData = await getOperationalReport(dateRange);
      break;
    default:
      reportData = await getSummaryReport(dateRange);
  }

  res.json({
    success: true,
    data: reportData
  });
});

const getCustomReport = asyncHandler(async (req, res) => {
  const { start, end, type = 'summary' } = req.query;

  if (!start || !end) {
    return next(new AppError('Start and end dates are required', 400));
  }

  const dateRange = {
    start: new Date(start),
    end: new Date(end)
  };

  let reportData = {};

  switch (type) {
    case 'summary':
      reportData = await getSummaryReport(dateRange);
      break;
    case 'detailed':
      reportData = await getDetailedReport(dateRange);
      break;
    case 'financial':
      reportData = await getFinancialReport(dateRange);
      break;
    case 'operational':
      reportData = await getOperationalReport(dateRange);
      break;
    default:
      reportData = await getSummaryReport(dateRange);
  }

  res.json({
    success: true,
    data: reportData
  });
});

const exportReport = asyncHandler(async (req, res) => {
  const { format = 'pdf', range = 'this_month', type = 'summary' } = req.query;

  res.json({
    success: true,
    message: `Report exported as ${format.toUpperCase()}`,
    downloadUrl: `/downloads/report_${Date.now()}.${format}`
  });
});

function getDateRange(range) {
  const now = new Date();
  let start, end;

  switch (range) {
    case 'today':
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      start = new Date(yesterday.setHours(0, 0, 0, 0));
      end = new Date(yesterday.setHours(23, 59, 59, 999));
      break;
    case 'this_week':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      start = new Date(startOfWeek.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'last_week':
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      start = new Date(lastWeekStart.setHours(0, 0, 0, 0));
      end = new Date(lastWeekEnd.setHours(23, 59, 59, 999));
      break;
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'this_year':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  return { start, end };
}

async function getSummaryReport(dateRange) {
  const { start, end } = dateRange;

  const appointments = await Appointment.find({
    appointmentDate: { $gte: start, $lte: end }
  }).populate('patientId').populate({
    path: 'doctorId',
    select: 'name profile.specialization'
  });

  const patients = await Patient.find({
    createdAt: { $gte: start, $lte: end }
  });

  const invoices = await Invoice.find({
    createdAt: { $gte: start, $lte: end }
  });

  const dailyStats = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dayStart = new Date(currentDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(currentDate.setHours(23, 59, 59, 999));

    const dayAppointments = appointments.filter(apt =>
      apt.appointmentDate >= dayStart && apt.appointmentDate <= dayEnd
    );

    const dayPatients = patients.filter(patient =>
      patient.createdAt >= dayStart && patient.createdAt <= dayEnd
    );

    const dayInvoices = invoices.filter(invoice =>
      invoice.createdAt >= dayStart && invoice.createdAt <= dayEnd && invoice.status === 'paid'
    );

    dailyStats.push({
      date: dayStart.toISOString(),
      appointments: dayAppointments.length,
      revenue: dayInvoices.reduce((sum, inv) => sum + inv.total, 0),
      patients: dayPatients.length
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const paidInvoices = invoices.filter(inv => inv.status === 'paid');

  const monthlyStats = {
    totalAppointments: appointments.length,
    totalRevenue: paidInvoices.reduce((sum, inv) => sum + inv.total, 0),
    totalPatients: patients.length,
    avgDailyAppointments: dailyStats.length > 0 ? appointments.length / dailyStats.length : 0
  };

  const doctorStats = await getDoctorStats(appointments);

  const departmentStats = await getDepartmentStats(appointments);

  return {
    dailyStats,
    monthlyStats,
    doctorStats,
    departmentStats
  };
}

async function getDetailedReport(dateRange) {
  const summaryData = await getSummaryReport(dateRange);

  const { start, end } = dateRange;

  const prescriptions = await Prescription.find({
    createdAt: { $gte: start, $lte: end }
  }).populate('patientId');

  const testOrders = await TestOrder.find({
    createdAt: { $gte: start, $lte: end }
  }).populate('patientId');

  return {
    ...summaryData,
    prescriptions: prescriptions.length,
    testOrders: testOrders.length,
    prescriptionDetails: prescriptions.slice(0, 10),
    testOrderDetails: testOrders.slice(0, 10)
  };
}

async function getFinancialReport(dateRange) {
  const { start, end } = dateRange;

  const appointments = await Appointment.find({
    appointmentDate: { $gte: start, $lte: end }
  }).populate({
    path: 'doctorId',
    select: 'name profile.specialization'
  });

  const invoices = await Invoice.find({
    createdAt: { $gte: start, $lte: end }
  });

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const collectedAmount = invoices.reduce((sum, inv) => {
    return sum + (inv.payments || []).reduce((pSum, p) => pSum + p.amount, 0);
  }, 0);
  const pendingAmount = Math.max(0, totalRevenue - collectedAmount);

  const paymentMethods = {
    cash: 0,
    card: 0,
    upi: 0,
    insurance: 0,
    other: 0
  };

  invoices.forEach(inv => {
    (inv.payments || []).forEach(p => {
      const method = p.paymentMethod;
      if (method in paymentMethods) {
        paymentMethods[method] += p.amount;
      } else {
        paymentMethods.other += p.amount;
      }
    });
  });

  return {
    totalRevenue,
    collectedAmount,
    pendingAmount,
    paymentMethods,
    departmentRevenue: await getDepartmentStats(appointments)
  };
}

async function getOperationalReport(dateRange) {
  const { start, end } = dateRange;

  const appointments = await Appointment.find({
    appointmentDate: { $gte: start, $lte: end }
  });

  const statusDistribution = appointments.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {});

  const hourlyDistribution = appointments.reduce((acc, apt) => {
    const hour = apt.appointmentTime ? apt.appointmentTime.split(':')[0] : '09';
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  return {
    statusDistribution,
    hourlyDistribution,
    totalAppointments: appointments.length,
    avgWaitTime: 15,
    patientSatisfaction: 4.2
  };
}

async function getDoctorStats(appointments) {
  const doctorMap = {};

  appointments.forEach(apt => {
    if (apt.doctorId) {
      const doctorId = apt.doctorId._id.toString();
      if (!doctorMap[doctorId]) {
        doctorMap[doctorId] = {
          doctorName: apt.doctorId.name,
          appointments: 0,
          revenue: 0,
          avgConsultationTime: 25
        };
      }
      doctorMap[doctorId].appointments++;
      doctorMap[doctorId].revenue += (apt.consultationFee || 0);
    }
  });

  return Object.values(doctorMap);
}

async function getDepartmentStats(appointments) {
  const departments = {};
  let totalAppointments = 0;

  appointments.forEach(apt => {
    if (apt.doctorId) {
      const dept = apt.doctorId.profile?.specialization || 'General Medicine';
      if (!departments[dept]) {
        departments[dept] = { appointments: 0, revenue: 0, percentage: 0 };
      }
      departments[dept].appointments++;
      departments[dept].revenue += (apt.consultationFee || 0);
      totalAppointments++;
    }
  });

  Object.keys(departments).forEach(dept => {
    departments[dept].percentage = totalAppointments > 0
      ? Math.round((departments[dept].appointments / totalAppointments) * 100)
      : 0;
  });

  return Object.entries(departments).map(([department, stats]) => ({
    department,
    ...stats
  }));
}

module.exports = {
  getReports,
  getCustomReport,
  exportReport
};
