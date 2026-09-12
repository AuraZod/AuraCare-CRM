const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./index');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    await createSoftwareOwner();
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

const createSoftwareOwner = async () => {
  try {
    const User = require('../models/User');

    const existingOwner = await User.findOne({ email: config.OWNER_EMAIL });

    if (!existingOwner) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(config.OWNER_PASSWORD, salt);

      const nameParts = config.OWNER_NAME.split(' ');
      const firstName = nameParts[0] || 'Software';
      const lastName = nameParts.slice(1).join(' ') || 'Owner';

      await User.create({
        name: config.OWNER_NAME,
        email: config.OWNER_EMAIL,
        password: hashedPassword,
        role: 'super_admin',
        profile: {
          firstName,
          lastName,
          department: 'Administration'
        },
        isActive: true
      });

      logger.info('Software owner created successfully');
    }
  } catch (error) {
    logger.error('Error creating software owner:', error);
  }
};

module.exports = connectDB;
