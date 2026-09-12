const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const ownerAuth = require('../middleware/ownerAuth');
const { validateLogin, validateCreateUser } = require('../middleware/validation');

router.post('/login', validateLogin, authController.login);

router.post('/refresh', authController.refreshToken);

router.post('/create-user', auth, validateCreateUser, authController.createUser);

router.get('/me', auth, authController.getMe);

router.get('/sessions', auth, authController.getUserSessions);

router.post('/logout', auth, authController.logout);

router.post('/invalidate-sessions', auth, authController.invalidateOtherSessions);

module.exports = router;
