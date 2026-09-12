const express = require('express');
const router = express.Router();
const {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  dispenseMedication,
  getPendingPrescriptions,
  getPatientPrescriptions
} = require('../controllers/prescriptionController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/pending',
  authorize('pharmacy', 'admin', 'super_admin'),
  getPendingPrescriptions
);

router.get('/patient/:patientId',
  authorize('doctor', 'pharmacy', 'admin', 'super_admin'),
  getPatientPrescriptions
);

router.route('/')
  .get(authorize('doctor', 'pharmacy', 'admin', 'super_admin'), getPrescriptions)
  .post(authorize('doctor'), createPrescription);

router.route('/:id')
  .get(authorize('doctor', 'pharmacy', 'admin', 'super_admin'), getPrescriptionById)
  .put(authorize('doctor', 'admin', 'super_admin'), updatePrescription);

router.put('/:id/dispense',
  authorize('pharmacy', 'admin', 'super_admin'),
  dispenseMedication
);

module.exports = router;
