const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const csv = require('csv-writer');
const ExcelJS = require('exceljs');

const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const TestOrder = require('../models/TestOrder');
const Invoice = require('../models/Invoice');
const Inventory = require('../models/Inventory');
const Equipment = require('../models/Equipment');
const Session = require('../models/Session');
const AuditLog = require('../models/AuditLog');
const Settings = require('../models/Settings');
const Backup = require('../models/Backup');

const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const getStorageStats = asyncHandler(async (req, res) => {
  try {

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    let totalSize = 0;
    const collectionStats = {};

    for (const collection of collections) {
      try {
        const stats = await db.collection(collection.name).stats();
        collectionStats[collection.name] = {
          size: stats.size || 0,
          count: stats.count || 0,
          avgObjSize: stats.avgObjSize || 0,
          storageSize: stats.storageSize || 0,
          indexSize: stats.totalIndexSize || 0
        };
        totalSize += stats.storageSize || 0;
      } catch (error) {

        collectionStats[collection.name] = {
          size: 0,
          count: 0,
          avgObjSize: 0,
          storageSize: 0,
          indexSize: 0
        };
      }
    }

    const categoryStats = {
      patients: (collectionStats.patients?.storageSize || 0) / (1024 * 1024),
      appointments: (collectionStats.appointments?.storageSize || 0) / (1024 * 1024),
      prescriptions: (collectionStats.prescriptions?.storageSize || 0) / (1024 * 1024),
      testorders: (collectionStats.testorders?.storageSize || 0) / (1024 * 1024),
      invoices: (collectionStats.invoices?.storageSize || 0) / (1024 * 1024),
      inventory: (collectionStats.inventories?.storageSize || 0) / (1024 * 1024),
      equipment: (collectionStats.equipment?.storageSize || 0) / (1024 * 1024),
      sessions: (collectionStats.sessions?.storageSize || 0) / (1024 * 1024),
      auditlogs: (collectionStats.auditlogs?.storageSize || 0) / (1024 * 1024),
      users: (collectionStats.users?.storageSize || 0) / (1024 * 1024)
    };

    let backupSize = 0;
    const backupDir = path.join(process.cwd(), 'backups');
    try {
      const backupFiles = await fs.readdir(backupDir);
      for (const file of backupFiles) {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);
        backupSize += stats.size;
      }
    } catch (error) {

    }

    const totalSizeGB = totalSize / (1024 * 1024 * 1024);
    const backupSizeGB = backupSize / (1024 * 1024 * 1024);

    res.json({
      success: true,
      data: {
        totalSize: totalSizeGB,
        backupSize: backupSizeGB,
        categories: categoryStats,
        collections: collectionStats,
        summary: {
          totalCollections: collections.length,
          totalDocuments: Object.values(collectionStats).reduce((sum, stat) => sum + stat.count, 0),
          averageDocumentSize: totalSize / Math.max(Object.values(collectionStats).reduce((sum, stat) => sum + stat.count, 0), 1)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting storage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get storage statistics',
      error: error.message
    });
  }
});

const getBackups = asyncHandler(async (req, res) => {
  try {
    const backups = await Backup.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedBackups = backups.map(backup => ({
      id: backup._id,
      name: backup.name,
      size: backup.formattedSize,
      date: backup.createdAt.toISOString(),
      type: backup.type,
      status: backup.status,
      createdBy: backup.createdBy?.name || 'System',
      metadata: backup.metadata
    }));

    res.json({
      success: true,
      data: formattedBackups
    });
  } catch (error) {
    logger.error('Error getting backups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get backup history',
      error: error.message
    });
  }
});

const createBackup = asyncHandler(async (req, res) => {
  try {
    const { type = 'manual', includeFiles = false } = req.body;
    const timestamp = new Date().toISOString().split('T')[0];
    const backupName = `backup_${timestamp}_${type}_${Date.now()}.json`;
    const backupDir = path.join(process.cwd(), 'backups');
    const backupPath = path.join(backupDir, backupName);

    await fs.mkdir(backupDir, { recursive: true });

    const backup = await Backup.create({
      name: backupName,
      fileName: backupName,
      type: type,
      status: 'in_progress',
      filePath: backupPath,
      createdBy: req.user._id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    const backupData = {
      metadata: {
        createdAt: new Date().toISOString(),
        type: type,
        version: '1.0.0',
        createdBy: req.user._id,
        backupId: backup._id
      },
      data: {}
    };

    const collections = [
      { name: 'patients', model: Patient },
      { name: 'users', model: User },
      { name: 'appointments', model: Appointment },
      { name: 'prescriptions', model: Prescription },
      { name: 'testorders', model: TestOrder },
      { name: 'invoices', model: Invoice },
      { name: 'inventory', model: Inventory },
      { name: 'equipment', model: Equipment },
      { name: 'settings', model: Settings }
    ];

    const collectionMetadata = [];
    let totalRecords = 0;

    for (const collection of collections) {
      try {
        const data = await collection.model.find({}).lean();
        backupData.data[collection.name] = data;

        const collectionInfo = {
          name: collection.name,
          count: data.length,
          size: JSON.stringify(data).length
        };

        collectionMetadata.push(collectionInfo);
        totalRecords += data.length;

        logger.info(`Backed up ${data.length} records from ${collection.name}`);
      } catch (error) {
        logger.error(`Error backing up ${collection.name}:`, error);
        backupData.data[collection.name] = [];
        collectionMetadata.push({
          name: collection.name,
          count: 0,
          size: 0
        });
      }
    }

    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
    const stats = await fs.stat(backupPath);

    await backup.markCompleted(stats.size, {
      collections: collectionMetadata,
      totalRecords: totalRecords,
      compressionRatio: 1
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'backup_created',
      resource: 'data_management',
      success: true,
      metadata: {
        backupId: backup._id,
        backupName: backupName,
        type: type,
        size: stats.size,
        totalRecords: totalRecords
      }
    });

    res.json({
      success: true,
      message: 'Backup created successfully',
      data: {
        id: backup._id,
        name: backup.name,
        size: backup.formattedSize,
        date: backup.createdAt.toISOString(),
        type: backup.type,
        status: backup.status
      }
    });
  } catch (error) {
    logger.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create backup',
      error: error.message
    });
  }
});

const exportData = asyncHandler(async (req, res) => {
  try {
    const { dataType = 'all', format = 'csv', dateRange } = req.body;

    let query = {};
    if (dateRange && dateRange.start && dateRange.end) {
      query.createdAt = {
        $gte: new Date(dateRange.start),
        $lte: new Date(dateRange.end)
      };
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const exportDir = path.join(process.cwd(), 'exports');
    await fs.mkdir(exportDir, { recursive: true });

    let exportData = {};
    let fileName = `export_${dataType}_${timestamp}`;

    switch (dataType) {
      case 'patients':
        exportData.patients = await Patient.find(query).populate('emergencyContact').lean();
        break;
      case 'appointments':
        exportData.appointments = await Appointment.find(query)
          .populate('patientId', 'firstName lastName phone')
          .populate('doctorId', 'name')
          .lean();
        break;
      case 'prescriptions':
        exportData.prescriptions = await Prescription.find(query)
          .populate('patientId', 'firstName lastName')
          .populate('doctorId', 'name')
          .lean();
        break;
      case 'billing':
        exportData.invoices = await Invoice.find(query)
          .populate('patientId', 'firstName lastName phone')
          .lean();
        break;
      case 'inventory':
        exportData.inventory = await Inventory.find(query).lean();
        break;
      case 'all':
      default:
        exportData = {
          patients: await Patient.find(query).lean(),
          appointments: await Appointment.find(query).populate('patientId doctorId').lean(),
          prescriptions: await Prescription.find(query).populate('patientId doctorId').lean(),
          invoices: await Invoice.find(query).populate('patientId').lean(),
          inventory: await Inventory.find(query).lean()
        };
        break;
    }

    let filePath;
    let downloadUrl;

    if (format === 'csv') {

      filePath = path.join(exportDir, `${fileName}.zip`);
      const output = require('fs').createWriteStream(filePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.pipe(output);

      for (const [collectionName, data] of Object.entries(exportData)) {
        if (data && data.length > 0) {
          const csvData = convertToCSV(data);
          archive.append(csvData, { name: `${collectionName}.csv` });
        }
      }

      await archive.finalize();
      downloadUrl = `/api/data-management/download/${path.basename(filePath)}`;

    } else if (format === 'excel') {

      filePath = path.join(exportDir, `${fileName}.xlsx`);
      const workbook = new ExcelJS.Workbook();

      for (const [collectionName, data] of Object.entries(exportData)) {
        if (data && data.length > 0) {
          const worksheet = workbook.addWorksheet(collectionName);

          const headers = Object.keys(data[0]);
          worksheet.addRow(headers);

          data.forEach(row => {
            const values = headers.map(header => {
              const value = row[header];
              return typeof value === 'object' ? JSON.stringify(value) : value;
            });
            worksheet.addRow(values);
          });
        }
      }

      await workbook.xlsx.writeFile(filePath);
      downloadUrl = `/api/data-management/download/${path.basename(filePath)}`;

    } else {

      filePath = path.join(exportDir, `${fileName}.json`);
      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));
      downloadUrl = `/api/data-management/download/${path.basename(filePath)}`;
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'data_exported',
      resource: 'data_management',
      success: true,
      metadata: {
        dataType: dataType,
        format: format,
        fileName: path.basename(filePath)
      }
    });

    res.json({
      success: true,
      message: `Data exported successfully as ${format.toUpperCase()}`,
      downloadUrl: downloadUrl,
      fileName: path.basename(filePath)
    });
  } catch (error) {
    logger.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
});

const downloadFile = asyncHandler(async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'exports', filename);

    await fs.access(filePath);

    res.download(filePath, filename, (error) => {
      if (error) {
        logger.error('Error downloading file:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to download file'
        });
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
});

const deleteBackup = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const backup = await Backup.findById(id);
    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    try {
      await fs.unlink(backup.filePath);
    } catch (error) {
      logger.warn(`Failed to delete backup file: ${backup.filePath}`, error);
    }

    await Backup.findByIdAndDelete(id);

    await AuditLog.create({
      userId: req.user._id,
      action: 'backup_deleted',
      resource: 'data_management',
      success: true,
      metadata: {
        backupId: id,
        backupName: backup.name
      }
    });

    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete backup',
      error: error.message
    });
  }
});

const getRetentionSettings = asyncHandler(async (req, res) => {
  try {
    const settings = await Settings.findOne({ type: 'data_retention' });

    const defaultSettings = {
      patientRecords: 'forever',
      backupFiles: '30days',
      auditLogs: '1year',
      sessions: '60days',
      appointments: 'forever',
      prescriptions: 'forever'
    };

    res.json({
      success: true,
      data: settings?.customSettings || defaultSettings
    });
  } catch (error) {
    logger.error('Error getting retention settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get retention settings',
      error: error.message
    });
  }
});

const updateRetentionSettings = asyncHandler(async (req, res) => {
  try {
    const retentionSettings = req.body;

    await Settings.findOneAndUpdate(
      { type: 'data_retention' },
      {
        type: 'data_retention',
        customSettings: retentionSettings
      },
      { upsert: true, new: true }
    );

    await AuditLog.create({
      userId: req.user._id,
      action: 'retention_settings_updated',
      resource: 'data_management',
      success: true,
      metadata: retentionSettings
    });

    res.json({
      success: true,
      message: 'Retention settings updated successfully',
      data: retentionSettings
    });
  } catch (error) {
    logger.error('Error updating retention settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update retention settings',
      error: error.message
    });
  }
});

function convertToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      if (typeof value === 'string' && value.includes(',')) return `"${value.replace(/"/g, '""')}"`;
      return value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

module.exports = {
  getStorageStats,
  getBackups,
  createBackup,
  exportData,
  downloadFile,
  deleteBackup,
  getRetentionSettings,
  updateRetentionSettings
};
