const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
require('dotenv').config();

const checkDatabase = async () => {
  console.log('Connecting to database...');
  console.log('DB_URI:', process.env.DB_URI ? 'Defined' : 'UNDEFINED');
  
  if (!process.env.DB_URI) {
    console.error('Error: DB_URI is not defined in backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    const userCount = await User.countDocuments();
    console.log(`Total users in database: ${userCount}`);

    if (userCount === 0) {
      console.log('⚠️ No users found in the database. Please run the database seeding script.');
      mongoose.disconnect();
      return;
    }

    const users = await User.find({}, 'name email role isActive');
    console.log('\n--- Registered Users ---');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: "${user.name}" | Email: "${user.email}" | Role: "${user.role}" | Active: ${user.isActive}`);
    });
    console.log('------------------------\n');

    const testLogins = [
      { email: 'admin@hospital.com', pass: 'password123' },
      { email: 'dr.sharma@hospital.com', pass: 'password123' },
      { email: process.env.OWNER_EMAIL, pass: process.env.OWNER_PASSWORD }
    ];

    console.log('--- Testing Password Hashes ---');
    for (const test of testLogins) {
      if (!test.email) continue;
      const user = await User.findOne({ email: test.email });
      if (!user) {
        console.log(`❌ User "${test.email}" does not exist in DB.`);
        continue;
      }

      const match = await bcrypt.compare(test.pass, user.password);
      if (match) {
        console.log(`✅ Match SUCCESS: "${test.email}" accepts password "${test.pass}"`);
      } else {
        console.log(`❌ Match FAILED: "${test.email}" REJECTS password "${test.pass}"`);
      }
    }
    console.log('--------------------------------\n');

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Connection or query error:', err.message);
    process.exit(1);
  }
};

checkDatabase();
