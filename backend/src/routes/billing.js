const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/invoices',
  authorize('receptionist', 'diagnostic', 'pharmacy', 'admin', 'super_admin'),
  billingController.getInvoices
);

router.get('/invoices/:id',
  authorize('receptionist', 'diagnostic', 'pharmacy', 'admin', 'super_admin'),
  billingController.getInvoiceById
);

router.post('/invoices',
  authorize('receptionist', 'diagnostic', 'pharmacy', 'admin', 'super_admin'),
  billingController.createInvoice
);

router.put('/invoices/:id',
  authorize('receptionist', 'admin', 'super_admin'),
  billingController.updateInvoice
);

router.post('/invoices/:id/payment',
  authorize('receptionist', 'admin', 'super_admin'),
  billingController.recordPayment
);

router.get('/stats',
  authorize('receptionist', 'diagnostic', 'pharmacy', 'admin', 'super_admin'),
  billingController.getBillingStats
);

router.get('/invoices/:id/export',
  authorize('receptionist', 'diagnostic', 'pharmacy', 'admin', 'super_admin'),
  billingController.exportInvoice
);

module.exports = router;
