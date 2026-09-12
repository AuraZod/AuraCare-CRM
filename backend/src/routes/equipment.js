const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/stats/overview',
  authorize('diagnostic', 'admin', 'super_admin'),
  equipmentController.getEquipmentStats
);

router.get('/',
  authorize('diagnostic', 'admin', 'super_admin'),
  equipmentController.getEquipment
);

router.get('/:id',
  authorize('diagnostic', 'admin', 'super_admin'),
  equipmentController.getEquipmentById
);

router.post('/',
  authorize('diagnostic', 'admin', 'super_admin'),
  equipmentController.createEquipment
);

router.put('/:id',
  authorize('diagnostic', 'admin', 'super_admin'),
  equipmentController.updateEquipment
);

router.delete('/:id',
  authorize('admin', 'super_admin'),
  equipmentController.deleteEquipment
);

router.post('/:id/maintenance',
  authorize('diagnostic', 'admin', 'super_admin'),
  equipmentController.updateMaintenanceStatus
);

module.exports = router;
