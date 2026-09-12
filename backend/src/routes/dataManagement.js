const express = require('express');
const router = express.Router();
const {
  getStorageStats,
  getBackups,
  createBackup,
  exportData,
  downloadFile,
  deleteBackup,
  getRetentionSettings,
  updateRetentionSettings
} = require('../controllers/dataManagementController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);
router.use(authorize('admin', 'super_admin'));

router.get('/storage-stats', getStorageStats);

router.route('/backups')
  .get(getBackups)
  .post(createBackup);

router.delete('/backups/:id', deleteBackup);

router.post('/export', exportData);
router.get('/download/:filename', downloadFile);

router.route('/retention')
  .get(getRetentionSettings)
  .put(updateRetentionSettings);

module.exports = router;
