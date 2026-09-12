const express = require('express');
const router = express.Router();
const {
  getReports,
  getCustomReport,
  exportReport
} = require('../controllers/reportsController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/',
  authorize('receptionist', 'admin', 'super_admin'),
  getReports
);

router.get('/custom',
  authorize('receptionist', 'admin', 'super_admin'),
  getCustomReport
);

router.get('/export',
  authorize('receptionist', 'admin', 'super_admin'),
  exportReport
);

module.exports = router;
