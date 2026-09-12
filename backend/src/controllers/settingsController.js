const Settings = require('../models/Settings');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getSettings = asyncHandler(async (req, res) => {
  const { type } = req.params;

  console.log(req.params)

  let settings = await Settings.findOne({ type });

  if (!settings) {
    settings = getDefaultSettings(type);
  }

  res.json({
    success: true,
    data: settings
  });
});

const updateSettings = asyncHandler(async (req, res) => {
  const { type } = req.params;

  let settings = await Settings.findOneAndUpdate(
    { type },
    { ...req.body, type },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({
    success: true,
    data: settings,
    message: 'Settings updated successfully'
  });
});

function getDefaultSettings(type) {
  const defaults = {
    hospital: {
      type: 'hospital',
      name: 'Aarogya Hospital',
      tagline: 'Your Health, Our Priority',
      email: 'contact@aarogyahospital.com',
      phone: '+91 98765 43210',
      address: '123 Healthcare Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      website: 'www.aarogyahospital.com',
      departments: ['General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics'],
      appointmentSystemType: 'time-limited',
      appointmentDuration: 30,
      maxAppointmentsPerSlot: 1,
      enableOnlineBooking: true,
      enableSmsNotifications: true,
      enableEmailNotifications: true,
      workingHours: {
        monday: { open: '09:00', close: '18:00', isOpen: true },
        tuesday: { open: '09:00', close: '18:00', isOpen: true },
        wednesday: { open: '09:00', close: '18:00', isOpen: true },
        thursday: { open: '09:00', close: '18:00', isOpen: true },
        friday: { open: '09:00', close: '18:00', isOpen: true },
        saturday: { open: '09:00', close: '14:00', isOpen: true },
        sunday: { open: '09:00', close: '14:00', isOpen: false }
      }
    },
    notification: {
      type: 'notification',
      enableSms: true,
      enableEmail: true,
      enablePush: false,
      reminderHoursBefore: 24
    },
    billing: {
      type: 'billing',
      currency: 'INR',
      taxRate: 18,
      invoicePrefix: 'INV',
      enableOnlinePayment: true
    }
  };

  return defaults[type] || { type };
}

module.exports = {
  getSettings,
  updateSettings
};
