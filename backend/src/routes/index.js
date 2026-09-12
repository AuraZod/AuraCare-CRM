const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const patientRoutes = require('./patients');
const appointmentRoutes = require('./appointments');
const prescriptionRoutes = require('./prescriptions');
const testOrderRoutes = require('./testOrders');
const inventoryRoutes = require('./inventory');
const equipmentRoutes = require('./equipment');
const dashboardRoutes = require('./dashboard');
const reportsRoutes = require('./reports');
const billingRoutes = require('./billing');
const serviceRoutes = require('./services');
const settingsRoutes = require('./settings');
const dataManagementRoutes = require('./dataManagement');
const messagesRoutes = require('./messages');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/test-orders', testOrderRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportsRoutes);
router.use('/billing', billingRoutes);
router.use('/services', serviceRoutes);
router.use('/settings', settingsRoutes);
router.use('/data-management', dataManagementRoutes);
router.use('/messages', messagesRoutes);

router.get('/', (req, res) => {
  res.json({
    message: 'Hospital CRM API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      patients: '/api/patients',
      appointments: '/api/appointments',
      prescriptions: '/api/prescriptions',
      testOrders: '/api/test-orders',
      inventory: '/api/inventory',
      equipment: '/api/equipment',
      dashboard: '/api/dashboard',
      reports: '/api/reports',
      billing: '/api/billing',
      services: '/api/services',
      settings: '/api/settings',
      dataManagement: '/api/data-management'
    },
    note: 'Role-based access control enabled. Only authorized users can access specific endpoints.'
  });
});

module.exports = router;
