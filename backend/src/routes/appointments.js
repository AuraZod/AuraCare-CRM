const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getTodayAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
  getQueue,
  getDoctorQueue,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/today', getTodayAppointments);
router.get('/queue', authorize('receptionist', 'doctor', 'admin', 'super_admin'), getQueue);
router.get('/queue/:doctorId', getDoctorQueue);

router.route('/')
  .get(authorize('receptionist', 'doctor', 'admin', 'super_admin'), getAppointments)
  .post(authorize('receptionist', 'doctor', 'admin', 'super_admin'), createAppointment);

router.route('/:id')
  .get(authorize('receptionist', 'doctor', 'admin', 'super_admin'), getAppointmentById)
  .put(authorize('receptionist', 'doctor', 'admin', 'super_admin'), updateAppointment)
  .delete(authorize('receptionist', 'admin', 'super_admin'), deleteAppointment);

router.put('/:id/cancel',
  authorize('receptionist', 'doctor', 'admin', 'super_admin'),
  cancelAppointment
);

router.put('/:id/status',
  authorize('receptionist', 'doctor', 'admin', 'super_admin'),
  updateAppointmentStatus
);

module.exports = router;
