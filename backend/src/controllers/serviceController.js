const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getServices = asyncHandler(async (req, res) => {
  const { category, isActive } = req.query;
  const query = {};

  if (category) query.category = category;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const services = await Service.find(query).sort({ category: 1, name: 1 });

  res.json({
    success: true,
    data: services,
    count: services.length
  });
});

const getServiceById = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  res.json({
    success: true,
    data: service
  });
});

const createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);

  res.status(201).json({
    success: true,
    data: service,
    message: 'Service created successfully'
  });
});

const updateService = asyncHandler(async (req, res, next) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  res.json({
    success: true,
    data: service,
    message: 'Service updated successfully'
  });
});

const deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  await service.deleteOne();

  res.json({
    success: true,
    message: 'Service deleted successfully'
  });
});

const getServiceStats = asyncHandler(async (req, res) => {
  const stats = await Service.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);

  const totalServices = await Service.countDocuments();
  const activeServices = await Service.countDocuments({ isActive: true });

  res.json({
    success: true,
    data: {
      totalServices,
      activeServices,
      byCategory: stats
    }
  });
});

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServiceStats
};
