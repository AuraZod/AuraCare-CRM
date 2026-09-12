const express = require('express');
const router = express.Router();
const {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  addStock,
  reduceStock,
  getLowStockItems,
  getExpiringItems,
  getExpiredItems,
  searchInventoryItems,
  getInventoryStats
} = require('../controllers/inventoryController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.get('/search', searchInventoryItems);
router.get('/stats', getInventoryStats);

router.get('/alerts/low-stock', getLowStockItems);
router.get('/alerts/expiring', getExpiringItems);
router.get('/alerts/expired', getExpiredItems);

router.route('/')
  .get(authorize('pharmacy', 'admin', 'super_admin'), getInventoryItems)
  .post(authorize('pharmacy', 'admin', 'super_admin'), createInventoryItem);

router.route('/:id')
  .get(authorize('pharmacy', 'admin', 'super_admin'), getInventoryItemById)
  .put(authorize('pharmacy', 'admin', 'super_admin'), updateInventoryItem)
  .delete(authorize('admin', 'super_admin'), deleteInventoryItem);

router.post('/:id/add-stock',
  authorize('pharmacy', 'admin', 'super_admin'),
  addStock
);

router.post('/:id/reduce-stock',
  authorize('pharmacy', 'admin', 'super_admin'),
  reduceStock
);

module.exports = router;
