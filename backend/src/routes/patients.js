const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  addMedicalHistory
} = require('../controllers/patientController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/search', searchPatients);

router.route('/')
  .get(authorize('receptionist', 'doctor', 'diagnostic', 'pharmacy', 'admin', 'super_admin'), getPatients)
  .post(authorize('receptionist', 'admin', 'super_admin'), createPatient);

router.route('/:id')
  .get(authorize('receptionist', 'doctor', 'diagnostic', 'pharmacy', 'admin', 'super_admin'), getPatientById)
  .put(authorize('receptionist', 'doctor', 'admin', 'super_admin'), updatePatient)
  .delete(authorize('admin', 'super_admin'), deletePatient);

router.post('/:id/medical-history',
  authorize('doctor', 'admin', 'super_admin'),
  addMedicalHistory
);

module.exports = router;
