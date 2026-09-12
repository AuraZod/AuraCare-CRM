const express = require('express');
const router = express.Router();
const {
  getReceptionistDashboard,
  getDoctorDashboard,
  getDiagnosticDashboard,
  getPharmacyDashboard,
  getAdminDashboard,
  getSuperAdminDashboard,
  getGeneralDashboard
} = require('../controllers/dashboardController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/general', getGeneralDashboard);

router.get('/receptionist',
  authorize('receptionist'),
  getReceptionistDashboard
);

router.get('/doctor',
  authorize('doctor'),
  getDoctorDashboard
);

router.get('/diagnostic',
  authorize('diagnostic'),
  getDiagnosticDashboard
);

router.get('/pharmacy',
  authorize('pharmacy'),
  getPharmacyDashboard
);

router.get('/admin',
  authorize('admin', 'super_admin'),
  getAdminDashboard
);

router.get('/super-admin',
  authorize('super_admin'),
  getSuperAdminDashboard
);

router.get('/super_admin',
  authorize('super_admin'),
  getSuperAdminDashboard
);

module.exports = router;
