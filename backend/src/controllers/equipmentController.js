const Equipment = require('../models/Equipment');
const logger = require('../utils/logger');

const getEquipment = async (req, res) => {
  try {
    const {
      status,
      type,
      location,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (location) filter.location = new RegExp(location, 'i');
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { serialNumber: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const equipment = await Equipment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Equipment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        equipment,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: equipment.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: error.message
    });
  }
};

const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    logger.error('Error fetching equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: error.message
    });
  }
};

const createEquipment = async (req, res) => {
  try {
    const {
      name,
      type,
      model,
      serialNumber,
      location,
      purchaseDate,
      warrantyExpiry,
      notes
    } = req.body;

    const existingEquipment = await Equipment.findOne({ serialNumber });
    if (existingEquipment) {
      return res.status(400).json({
        success: false,
        message: 'Equipment with this serial number already exists'
      });
    }

    const equipment = new Equipment({
      name,
      type,
      model,
      serialNumber,
      location,
      purchaseDate,
      warrantyExpiry,
      status: 'operational',
      usageHours: 0,
      lastMaintenance: new Date(),
      nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      notes,
      createdBy: req.user.id
    });

    await equipment.save();

    logger.info(`Equipment created: ${name} (${serialNumber}) by user: ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: equipment
    });
  } catch (error) {
    logger.error('Error creating equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create equipment',
      error: error.message
    });
  }
};

const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates.createdBy;
    delete updates.createdAt;

    updates.updatedBy = req.user.id;

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    logger.info(`Equipment updated: ${equipment.name} (${equipment.serialNumber})`);

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: equipment
    });
  } catch (error) {
    logger.error('Error updating equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update equipment',
      error: error.message
    });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findByIdAndDelete(id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    logger.info(`Equipment deleted: ${equipment.name} (${equipment.serialNumber})`);

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete equipment',
      error: error.message
    });
  }
};

const updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      lastMaintenance,
      nextMaintenance,
      notes,
      usageHours
    } = req.body;

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    if (status) equipment.status = status;
    if (lastMaintenance) equipment.lastMaintenance = new Date(lastMaintenance);
    if (nextMaintenance) equipment.nextMaintenance = new Date(nextMaintenance);
    if (notes) equipment.notes = notes;
    if (usageHours !== undefined) equipment.usageHours = usageHours;

    equipment.updatedBy = req.user.id;

    equipment.maintenanceHistory.push({
      date: new Date(),
      type: status === 'maintenance' ? 'scheduled' : 'repair',
      description: notes || `Status updated to ${status}`,
      performedBy: req.user.id,
      cost: 0
    });

    await equipment.save();

    logger.info(`Equipment maintenance updated: ${equipment.name} - Status: ${status}`);

    res.json({
      success: true,
      message: 'Equipment maintenance status updated successfully',
      data: equipment
    });
  } catch (error) {
    logger.error('Error updating equipment maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update equipment maintenance',
      error: error.message
    });
  }
};

const getEquipmentStats = async (req, res) => {
  try {
    const [
      totalEquipment,
      operationalCount,
      maintenanceCount,
      outOfOrderCount,
      calibrationCount,
      upcomingMaintenance
    ] = await Promise.all([
      Equipment.countDocuments(),
      Equipment.countDocuments({ status: 'operational' }),
      Equipment.countDocuments({ status: 'maintenance' }),
      Equipment.countDocuments({ status: 'out-of-order' }),
      Equipment.countDocuments({ status: 'calibration' }),
      Equipment.countDocuments({
        nextMaintenance: {
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    const equipmentByType = await Equipment.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalEquipment,
        operationalCount,
        maintenanceCount,
        outOfOrderCount,
        calibrationCount,
        upcomingMaintenance,
        equipmentByType,
        utilizationRate: totalEquipment > 0 ? ((operationalCount / totalEquipment) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    logger.error('Error fetching equipment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment statistics',
      error: error.message
    });
  }
};

module.exports = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  updateMaintenanceStatus,
  getEquipmentStats
};
