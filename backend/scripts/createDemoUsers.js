const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const config = require('../src/config');

const demoUsers = [
  {
    name: 'Sarah Johnson',
    email: 'receptionist@hospital.com',
    password: 'password123',
    role: 'receptionist',
    profile: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+91 98765 43210',
      department: 'Front Desk'
    }
  },
  {
    name: 'Dr. Rajesh Kumar',
    email: 'doctor@hospital.com',
    password: 'password123',
    role: 'doctor',
    profile: {
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '+91 98765 43211',
      department: 'Cardiology',
      specialization: 'Cardiologist'
    }
  },
  {
    name: 'Priya Sharma',
    email: 'diagnostic@hospital.com',
    password: 'password123',
    role: 'diagnostic',
    profile: {
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91 98765 43212',
      department: 'Laboratory'
    }
  },
  {
    name: 'Amit Patel',
    email: 'pharmacy@hospital.com',
    password: 'password123',
    role: 'pharmacy',
    profile: {
      firstName: 'Amit',
      lastName: 'Patel',
      phone: '+91 98765 43213',
      department: 'Pharmacy'
    }
  },
  {
    name: 'Sunita Verma',
    email: 'admin@hospital.com',
    password: 'password123',
    role: 'admin',
    profile: {
      firstName: 'Sunita',
      lastName: 'Verma',
      phone: '+91 98765 43214',
      department: 'Administration'
    }
  },
  {
    name: 'Dr. Vikram Singh',
    email: 'superadmin@hospital.com',
    password: 'password123',
    role: 'super_admin',
    profile: {
      firstName: 'Vikram',
      lastName: 'Singh',
      phone: '+91 98765 43215',
      department: 'Management',
      specialization: 'Hospital Director'
    }
  }
];

async function createDemoUsers() {
  try {
    await mongoose.connect(config.DB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared existing users');

    for (const userData of demoUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const user = new User({
        ...userData,
        password: hashedPassword,
        isActive: true
      });

      await user.save();
      console.log(`Created user: ${userData.name} (${userData.role})`);
    }

    console.log('\n✅ Demo users created successfully!');
    console.log('\nDemo Credentials:');
    demoUsers.forEach(user => {
      console.log(`${user.role}: ${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('Error creating demo users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

createDemoUsers();