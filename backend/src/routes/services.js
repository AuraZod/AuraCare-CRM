const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { auth } = require('../middleware/auth');

router.get('/', auth, serviceController.getServices);

router.get('/stats', auth, serviceController.getServiceStats);

router.get('/:id', auth, serviceController.getServiceById);

router.post('/', auth, serviceController.createService);

router.put('/:id', auth, serviceController.updateService);

router.delete('/:id', auth, serviceController.deleteService);

module.exports = router;
