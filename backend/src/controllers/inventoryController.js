const Inventory = require('../models/Inventory');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getInventoryItems = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { category, search, lowStock, expiringSoon } = req.query;

  let query = { isActive: true };

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { genericName: { $regex: search, $options: 'i' } },
      { itemCode: { $regex: search, $options: 'i' } },
      { manufacturer: { $regex: search, $options: 'i' } }
    ];
  }

  let items = await Inventory.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 })
    .populate('createdBy', 'name email');

  if (lowStock === 'true') {
    items = items.filter(item => item.isLowStock);
  }

  if (expiringSoon === 'true') {
    items = items.filter(item => item.expiringSoon.length > 0);
  }

  const total = await Inventory.countDocuments(query);

  res.json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

const getInventoryItemById = asyncHandler(async (req, res, next) => {
  const item = await Inventory.findById(req.params.id)
    .populate('createdBy', 'name email');

  if (!item) {
    return next(new AppError('Inventory item not found', 404));
  }

  res.json({
    success: true,
    data: item,
  });
});

const createInventoryItem = asyncHandler(async (req, res) => {
  const itemData = {
    ...req.body,
    createdBy: req.user.id
  };

  const item = await Inventory.create(itemData);

  res.status(201).json({
    success: true,
    data: item,
    message: 'Inventory item created successfully'
  });
});

const updateInventoryItem = asyncHandler(async (req, res, next) => {
  const item = await Inventory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!item) {
    return next(new AppError('Inventory item not found', 404));
  }

  res.json({
    success: true,
    data: item,
    message: 'Inventory item updated successfully'
  });
});

const deleteInventoryItem = asyncHandler(async (req, res, next) => {
  const item = await Inventory.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!item) {
    return next(new AppError('Inventory item not found', 404));
  }

  res.json({
    success: true,
    message: 'Inventory item deactivated successfully'
  });
});

const addStock = asyncHandler(async (req, res, next) => {
  const item = await Inventory.findById(req.params.id);

  if (!item) {
    return next(new AppError('Inventory item not found', 404));
  }

  const batchData = {
    ...req.body,
    receivedDate: new Date()
  };

  await item.addStock(batchData);

  res.json({
    success: true,
    data: item,
    message: 'Stock added successfully'
  });
});

const reduceStock = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const item = await Inventory.findById(req.params.id);

  if (!item) {
    return next(new AppError('Inventory item not found', 404));
  }

  if (quantity > item.availableQuantity) {
    return next(new AppError('Insufficient stock available', 400));
  }

  const success = item.reduceStock(quantity);

  if (!success) {
    return next(new AppError('Failed to reduce stock', 400));
  }

  await item.save();

  res.json({
    success: true,
    data: item,
    message: 'Stock reduced successfully'
  });
});

const getLowStockItems = asyncHandler(async (req, res) => {
  const items = await Inventory.find({ isActive: true });
  const lowStockItems = items.filter(item => item.isLowStock);

  res.json({
    success: true,
    data: lowStockItems,
    count: lowStockItems.length
  });
});

const getExpiringItems = asyncHandler(async (req, res) => {
  const items = await Inventory.find({ isActive: true });
  const expiringItems = items.filter(item => item.expiringSoon.length > 0);

  res.json({
    success: true,
    data: expiringItems,
    count: expiringItems.length
  });
});

const getExpiredItems = asyncHandler(async (req, res) => {
  const items = await Inventory.find({ isActive: true });
  const expiredItems = items.filter(item => item.expiredQuantity > 0);

  res.json({
    success: true,
    data: expiredItems,
    count: expiredItems.length
  });
});

const searchInventoryItems = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.json({
      success: true,
      data: []
    });
  }

  const items = await Inventory.find({
    isActive: true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { genericName: { $regex: query, $options: 'i' } },
      { itemCode: { $regex: query, $options: 'i' } }
    ]
  }).limit(10).select('name genericName itemCode category unit strength form availableQuantity');

  res.json({
    success: true,
    data: items
  });
});

const getInventoryStats = asyncHandler(async (req, res) => {
  const items = await Inventory.find({ isActive: true });

  const stats = {
    totalItems: items.length,
    totalValue: items.reduce((total, item) => {
      const currentPrice = item.getCurrentSellingPrice();
      return total + (item.availableQuantity * currentPrice);
    }, 0),
    lowStockCount: items.filter(item => item.isLowStock).length,
    expiringSoonCount: items.filter(item => item.expiringSoon.length > 0).length,
    expiredCount: items.filter(item => item.expiredQuantity > 0).length,
    categoryBreakdown: {}
  };

  items.forEach(item => {
    if (!stats.categoryBreakdown[item.category]) {
      stats.categoryBreakdown[item.category] = 0;
    }
    stats.categoryBreakdown[item.category]++;
  });

  res.json({
    success: true,
    data: stats
  });
});

module.exports = {
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
};
