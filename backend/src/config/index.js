require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,

  DB_URI: process.env.DB_URI || 'mongodb://localhost:27017/express-app',

  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '60d',

  SESSION_MAX_AGE: process.env.SESSION_MAX_AGE || '30d',
  SESSION_CLEANUP_INTERVAL: process.env.SESSION_CLEANUP_INTERVAL || '24h',

  OWNER_EMAIL: process.env.OWNER_EMAIL || 'owner@company.com',
  OWNER_PASSWORD: process.env.OWNER_PASSWORD || 'Owner123!',
  OWNER_NAME: process.env.OWNER_NAME || 'Software Owner',

  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  S3_BUCKET: process.env.S3_BUCKET,
};
