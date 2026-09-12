const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { auth } = require('../middleware/auth');

router.get('/:type', auth, settingsController.getSettings);

router.post('/:type', auth, settingsController.updateSettings);

module.exports = router;
