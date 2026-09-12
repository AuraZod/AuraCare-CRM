const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

router.get('/', auth, authorize('admin', 'super_admin'), userController.getUsers);

router.get('/doctors', auth, userController.getDoctors);

router.post('/', auth, authorize('admin', 'super_admin'), userController.createUser);

router.get('/profile', auth, userController.getProfile);

router.put('/profile', auth, validateUser, userController.updateProfile);

router.get('/:id', auth, userController.getUserById);

router.put('/:id', auth, authorize('admin', 'super_admin'), validateUser, userController.updateUser);

router.delete('/:id', auth, authorize('admin', 'super_admin'), userController.deleteUser);

router.get('/:id/activity', auth, authorize('admin', 'super_admin'), userController.getUserActivity);

router.get('/:id/behavior', auth, authorize('admin', 'super_admin'), userController.getUserBehavior);

router.get('/:id/sessions', auth, authorize('admin', 'super_admin'), userController.getUserSessions);

module.exports = router;
