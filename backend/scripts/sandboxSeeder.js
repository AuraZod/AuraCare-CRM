const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
require('dotenv').config();

const usersToSeed = [
  {
    name: 'Demo Doctor',
    email: 'doctor@hospital.com',
    password: 'password123',
    role: 'doctor',
    profile: { firstName: 'Demo', lastName: 'Doctor', specialization: 'General Medicine' }
  },
  {
    name: 'Demo Receptionist',
    email: 'receptionist@hospital.com',
    password: 'password123',
    role: 'receptionist',
    profile: { firstName: 'Demo', lastName: 'Receptionist' }
  },
  {
    name: 'Demo Diagnostic',
    email: 'diagnostic@hospital.com',
    password: 'password123',
    role: 'diagnostic',
    profile: { firstName: 'Demo', lastName: 'Diagnostic' }
  },
  {
    name: 'Demo Pharmacy',
    email: 'pharmacy@hospital.com',
    password: 'password123',
    role: 'pharmacy',
    profile: { firstName: 'Demo', lastName: 'Pharmacy' }
  },
  {
    name: 'Admin User',
    email: 'admin@hospital.com',
    password: 'password123',
    role: 'admin',
    profile: { firstName: 'Admin', lastName: 'User' }
  },
  {
    name: 'SuperAdmin User',
    email: 'superadmin@hospital.com',
    password: 'password123',
    role: 'super_admin',
    profile: { firstName: 'SuperAdmin', lastName: 'User' }
  },
  {
    name: 'Software Owner',
    email: process.env.OWNER_EMAIL || 'AuraTheGreat@company.com',
    password: process.env.OWNER_PASSWORD || 'AuraTheGreatOwneRForReAl@88080808',
    role: 'super_admin',
    profile: { firstName: 'Software', lastName: 'Owner' }
  }
];

const seedSandbox = async () => {
  console.log('Connecting to database...');
  if (!process.env.DB_URI) {
    console.error('❌ Error: DB_URI is not defined in backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB!');

    console.log('Cleaning existing user collection...');
    await User.deleteMany({});

    console.log('Hashing passwords and seeding users...');
    for (const u of usersToSeed) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);
      
      await User.create({
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        profile: u.profile,
        isActive: true
      });
      console.log(`+ Created: ${u.email} (${u.role})`);
    }

    console.log('\n🎉 Sandbox seeding completed successfully!');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error during seeding:', err.message);
    process.exit(1);
  }
};

seedSandbox();
