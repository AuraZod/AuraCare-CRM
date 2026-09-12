const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const TestOrder = require('../models/TestOrder');
const logger = require('../utils/logger');

const getInvoices = async (req, res) => {
  try {
    const {
      status,
      patientId,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (patientId) filter.patientId = patientId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const invoices = await Invoice.find(filter)
      .populate('patientId', 'firstName lastName phone email')
      .populate('appointmentId', 'appointmentDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(filter);

    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: invoices.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate('patientId', 'firstName lastName phone email address')
      .populate('appointmentId', 'appointmentDate doctorId')
      .populate('testOrderIds', 'testName price status');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    logger.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: error.message
    });
  }
};

const createInvoice = async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      testOrderIds = [],
      services = [],
      consultationFee = 0,
      discount = 0,
      notes
    } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    let subtotal = consultationFee;

    if (testOrderIds.length > 0) {
      const testOrders = await TestOrder.find({ _id: { $in: testOrderIds } });
      subtotal += testOrders.reduce((sum, test) => sum + (test.price || 0), 0);
    }

    subtotal += services.reduce((sum, service) => sum + (service.price || 0), 0);

    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;
    const tax = total * 0.18;
    const finalAmount = total + tax;

    const invoiceCount = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

    const invoice = new Invoice({
      invoiceNumber,
      patientId,
      appointmentId,
      testOrderIds,
      services,
      consultationFee,
      subtotal,
      discount,
      discountAmount,
      tax,
      total: finalAmount,
      status: 'pending',
      notes,
      createdBy: req.user.id
    });

    await invoice.save();

    await invoice.populate('patientId', 'firstName lastName phone email');

    logger.info(`Invoice created: ${invoiceNumber} for patient: ${patient.firstName} ${patient.lastName}`);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { ...updates, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).populate('patientId', 'firstName lastName phone email');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    logger.info(`Invoice updated: ${invoice.invoiceNumber}`);

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    logger.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice',
      error: error.message
    });
  }
};

const recordPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount,
      paymentMethod,
      transactionId,
      notes
    } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const payment = {
      amount: parseFloat(amount),
      paymentMethod,
      transactionId,
      notes,
      recordedBy: req.user.id,
      recordedAt: new Date()
    };

    invoice.payments.push(payment);

    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

    if (totalPaid >= invoice.total) {
      invoice.status = 'paid';
      invoice.paidAt = new Date();
    } else if (totalPaid > 0) {
      invoice.status = 'partial';
    }

    await invoice.save();
    await invoice.populate('patientId', 'firstName lastName phone email');

    logger.info(`Payment recorded for invoice: ${invoice.invoiceNumber}, Amount: ${amount}`);

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: invoice
    });
  } catch (error) {
    logger.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment',
      error: error.message
    });
  }
};

const getBillingStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const startOfThisMonth = new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);

    const startOfLastMonth = new Date(startOfThisMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const endOfLastMonth = new Date(startOfThisMonth);
    endOfLastMonth.setMilliseconds(-1);

    const [
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      partialInvoices,
      totalRevenueAgg,
      pendingAmountAgg,
      todayRevenueAgg,
      thisMonthRevenueAgg,
      lastMonthRevenueAgg,
      paymentMethodsAgg
    ] = await Promise.all([
      Invoice.countDocuments(dateFilter),
      Invoice.countDocuments({ ...dateFilter, status: 'paid' }),
      Invoice.countDocuments({ ...dateFilter, status: 'pending' }),
      Invoice.countDocuments({ ...dateFilter, status: 'partial' }),
      Invoice.aggregate([
        { $match: { ...dateFilter, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Invoice.aggregate([
        { $match: { ...dateFilter, status: { $in: ['pending', 'partial'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Invoice.aggregate([
        { $match: { createdAt: { $gte: startOfToday, $lte: endOfToday }, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Invoice.aggregate([
        { $match: { createdAt: { $gte: startOfThisMonth }, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Invoice.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Invoice.aggregate([
        { $match: dateFilter },
        { $unwind: '$payments' },
        { $group: { _id: '$payments.paymentMethod', total: { $sum: '$payments.amount' } } }
      ])
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const pendingAmount = pendingAmountAgg[0]?.total || 0;
    const todayRevenue = todayRevenueAgg[0]?.total || 0;
    const thisMonthRevenue = thisMonthRevenueAgg[0]?.total || 0;
    const lastMonthRevenue = lastMonthRevenueAgg[0]?.total || 0;

    let revenueGrowth = 0;
    if (lastMonthRevenue > 0) {
      revenueGrowth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    } else if (thisMonthRevenue > 0) {
      revenueGrowth = 100;
    }

    const paymentMethods = {
      card: 0,
      cash: 0,
      upi: 0,
      insurance: 0,
      other: 0
    };

    paymentMethodsAgg.forEach(item => {
      const method = item._id;
      const total = item.total || 0;
      if (method in paymentMethods) {
        paymentMethods[method] = total;
      } else {
        paymentMethods.other += total;
      }
    });

    res.json({
      success: true,
      data: {
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        partialInvoices,
        totalRevenue,
        pendingAmount,
        todayRevenue,
        revenueGrowth,
        paymentMethods,
        collectionRate: totalInvoices > 0 ? ((paidInvoices / totalInvoices) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    logger.error('Error fetching billing stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing statistics',
      error: error.message
    });
  }
};

const exportInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate('patientId', 'firstName lastName phone email address')
      .populate('appointmentId', 'appointmentDate doctorId')
      .populate('testOrderIds', 'testName price status');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'PDF export functionality will be implemented',
      data: invoice
    });
  } catch (error) {
    logger.error('Error exporting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export invoice',
      error: error.message
    });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  recordPayment,
  getBillingStats,
  exportInvoice
};
