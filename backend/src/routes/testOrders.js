const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
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
} = require('../controllers/testOrderController');
const { auth, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/test-reports/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {

  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and Word documents are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: fileFilter
});

router.use(auth);

router.get('/pending',
  authorize('diagnostic', 'admin', 'super_admin'),
  getPendingTestOrders
);

router.get('/completed',
  authorize('doctor', 'diagnostic', 'admin', 'super_admin'),
  getCompletedTestOrders
);

router.route('/')
  .get(authorize('doctor', 'diagnostic', 'admin', 'super_admin'), getTestOrders)
  .post(authorize('doctor'), createTestOrder);

router.route('/:id')
  .get(authorize('doctor', 'diagnostic', 'admin', 'super_admin'), getTestOrderById)
  .put(authorize('doctor', 'diagnostic', 'admin', 'super_admin'), updateTestOrder);

router.put('/:id/sample-collected',
  authorize('diagnostic', 'admin', 'super_admin'),
  updateSampleCollection
);

router.put('/:id/results',
  authorize('diagnostic', 'admin', 'super_admin'),
  updateTestResults
);

router.put('/:id/review',
  authorize('doctor'),
  markAsReviewed
);

router.post('/:id/upload-report',
  authorize('diagnostic', 'admin', 'super_admin'),
  upload.single('report'),
  uploadTestReport
);

router.get('/:id/download-report',
  authorize('doctor', 'diagnostic', 'admin', 'super_admin'),
  downloadTestReport
);

router.get('/:id/report',
  authorize('doctor', 'diagnostic', 'admin', 'super_admin'),
  getTestReport
);

module.exports = router;
