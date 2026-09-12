const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Patient = require('../src/models/Patient');
const Appointment = require('../src/models/Appointment');
const Prescription = require('../src/models/Prescription');
const TestOrder = require('../src/models/TestOrder');
const Inventory = require('../src/models/Inventory');
const Equipment = require('../src/models/Equipment');
const Invoice = require('../src/models/Invoice');
const Message = require('../src/models/Message');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createSampleUsers = async () => {
  console.log('Creating sample users...');
  
  const users = [
    {
      name: 'Demo Doctor',
      email: 'doctor@hospital.com',
      password: await bcrypt.hash('password123', 12),
      role: 'doctor',
      profile: {
        firstName: 'Demo',
        lastName: 'Doctor',
        phone: '+91 98765 43220',
        specialization: 'General Medicine'
      },
      isActive: true
    },
    {
      name: 'Demo Receptionist',
      email: 'receptionist@hospital.com',
      password: await bcrypt.hash('password123', 12),
      role: 'receptionist',
      profile: {
        firstName: 'Demo',
        lastName: 'Receptionist',
        phone: '+91 98765 43221'
      },
      isActive: true
    },
    {
      name: 'Demo Diagnostic',
      email: 'diagnostic@hospital.com',
      password: await bcrypt.hash('password123', 12),
      role: 'diagnostic',
      profile: {
        firstName: 'Demo',
        lastName: 'Diagnostic',
        phone: '+91 98765 43222'
      },
      isActive: true
    },
    {
      name: 'Demo Pharmacy',
      email: 'pharmacy@hospital.com',
      password: await bcrypt.hash('password123', 12),
      role: 'pharmacy',
      profile: {
        firstName: 'Demo',
        lastName: 'Pharmacy',
        phone: '+91 98765 43223'
      },
      isActive: true
    },
    {
      name: 'Dr. Rajesh Sharma',
      email: 'dr.sharma@hospital.com',
      password: await bcrypt.hash('password123', 12),
      role: 'doctor',
      profile: {
        firstName: 'Rajesh',
        lastName: 'Sharma',
        phone: '+91 98765 43210',
        specialization: 'Cardiology'
      },
      isActive: true
    },
    {
      name: 'Dr. Priya Patel',
      email: 'dr.patel@hospital.com',
      password: await bcrypt.hash('password123', 12),
      role: 'doctor',
      profile: {
        firstName: 'Priya',
        lastName: 'Patel',
        phone: '+91 98765 43211',
        specialization: 'Pediatrics'
      },
      isActive: true
    },
    {
      name: 'Sunita Receptionist',
      email: 'sunita@hospital.com',
      password: await bcrypt.hash('password123', 12),
      role: 'receptionist',
      profile: {
        firstName: 'Sunita',
        lastName: 'Kumar',
        phone: '+91 98765 43212'
      },
      isActive: true
    },
    {
      name: 'Amit Diagnostic',
      email: 'amit@hospital.com',
      password: await bcrypt.hash('password123', 12),
      role: 'diagnostic',
      profile: {
        firstName: 'Amit',
        lastName: 'Singh',
        phone: '+91 98765 43213'
      },
      isActive: true
    },
    {
      name: 'Ravi Pharmacy',
      email: 'ravi@hospital.com',
      password: await bcrypt.hash('password123', 12),
      role: 'pharmacy',
      profile: {
        firstName: 'Ravi',
        lastName: 'Gupta',
        phone: '+91 98765 43214'
      },
      isActive: true
    },
    {
      name: 'Admin User',
      email: 'admin@hospital.com',
      password: await bcrypt.hash('password123', 12),
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        phone: '+91 98765 43215'
      },
      isActive: true
    },
    {
      name: 'SuperAdmin User',
      email: 'superadmin@hospital.com',
      password: await bcrypt.hash('password123', 12),
      role: 'super_admin',
      profile: {
        firstName: 'SuperAdmin',
        lastName: 'User',
        phone: '+91 98765 43216'
      },
      isActive: true
    }
  ];

  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} users`);
  return createdUsers;
};

const createSamplePatients = async (users) => {
  console.log('Creating sample patients...');
  
  const receptionistUser = users.find(u => u.role === 'receptionist');
  
  const patients = [
    {
      firstName: 'Ramesh',
      lastName: 'Kumar',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male',
      phone: '+91 98765 54321',
      email: 'ramesh.kumar@email.com',
      address: {
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      emergencyContact: {
        name: 'Sunita Kumar',
        relationship: 'wife',
        phone: '+91 98765 54322',
        email: 'sunita.kumar@email.com'
      },
      allergies: ['Penicillin', 'Peanuts'],
      createdBy: receptionistUser._id
    },
    {
      firstName: 'Meera',
      lastName: 'Sharma',
      dateOfBirth: new Date('1990-08-22'),
      gender: 'female',
      phone: '+91 98765 54323',
      email: 'meera.sharma@email.com',
      address: {
        street: '456 Park Avenue',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India'
      },
      emergencyContact: {
        name: 'Raj Sharma',
        relationship: 'husband',
        phone: '+91 98765 54324',
        email: 'raj.sharma@email.com'
      },
      allergies: ['Dust'],
      createdBy: receptionistUser._id
    },
    {
      firstName: 'Arjun',
      lastName: 'Singh',
      dateOfBirth: new Date('1978-12-10'),
      gender: 'male',
      phone: '+91 98765 54325',
      email: 'arjun.singh@email.com',
      address: {
        street: '789 Garden Road',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India'
      },
      emergencyContact: {
        name: 'Kavita Singh',
        relationship: 'wife',
        phone: '+91 98765 54326',
        email: 'kavita.singh@email.com'
      },
      allergies: [],
      createdBy: receptionistUser._id
    }
  ];

  await Patient.deleteMany({});
  const createdPatients = await Patient.insertMany(patients);
  console.log(`Created ${createdPatients.length} patients`);
  return createdPatients;
};

const createSampleAppointments = async (users, patients) => {
  console.log('Creating sample appointments...');
  
  const doctors = users.filter(u => u.role === 'doctor');
  const receptionistUser = users.find(u => u.role === 'receptionist');
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const appointments = [
    {
      patientId: patients[0]._id,
      doctorId: doctors[0]._id,
      appointmentDate: today,
      appointmentTime: '09:00',
      duration: 30,
      type: 'consultation',
      status: 'scheduled',
      priority: 'normal',
      reason: 'Regular checkup',
      consultationFee: 500,
      paymentStatus: 'pending',
      createdBy: receptionistUser._id
    },
    {
      patientId: patients[1]._id,
      doctorId: doctors[1]._id,
      appointmentDate: today,
      appointmentTime: '10:00',
      duration: 30,
      type: 'consultation',
      status: 'confirmed',
      priority: 'normal',
      reason: 'Pediatric consultation',
      consultationFee: 600,
      paymentStatus: 'paid',
      createdBy: receptionistUser._id
    },
    {
      patientId: patients[2]._id,
      doctorId: doctors[0]._id,
      appointmentDate: today,
      appointmentTime: '11:00',
      duration: 30,
      type: 'follow-up',
      status: 'in-progress',
      priority: 'normal',
      reason: 'Follow-up for hypertension',
      consultationFee: 400,
      paymentStatus: 'paid',
      actualStartTime: new Date(),
      createdBy: receptionistUser._id
    },
    {
      patientId: patients[0]._id,
      doctorId: doctors[1]._id,
      appointmentDate: tomorrow,
      appointmentTime: '14:00',
      duration: 30,
      type: 'consultation',
      status: 'scheduled',
      priority: 'urgent',
      reason: 'Chest pain evaluation',
      consultationFee: 800,
      paymentStatus: 'pending',
      createdBy: receptionistUser._id
    }
  ];

  await Appointment.deleteMany({});
  const createdAppointments = await Appointment.insertMany(appointments);
  console.log(`Created ${createdAppointments.length} appointments`);
  return createdAppointments;
};

const createSampleInventory = async (users) => {
  console.log('Creating sample inventory...');
  
  const pharmacyUser = users.find(u => u.role === 'pharmacy');
  
  const inventoryItems = [
    {
      itemCode: 'MED001',
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      category: 'medicine',
      subCategory: 'Analgesic',
      manufacturer: 'ABC Pharma',
      description: 'Pain relief and fever reducer',
      unit: 'tablet',
      strength: '500mg',
      form: 'tablet',
      batches: [{
        batchNumber: 'PAR001',
        manufacturingDate: new Date('2024-01-15'),
        expiryDate: new Date('2026-01-15'),
        quantity: 1000,
        costPrice: 2,
        sellingPrice: 3,
        receivedDate: new Date('2024-02-01'),
        status: 'active'
      }],
      reorderLevel: 100,
      maxStockLevel: 2000,
      location: { rack: 'A', shelf: '1', bin: '1' },
      storageConditions: 'room_temperature',
      prescriptionRequired: false,
      createdBy: pharmacyUser._id
    },
    {
      itemCode: 'MED002',
      name: 'Amoxicillin 250mg',
      genericName: 'Amoxicillin',
      category: 'medicine',
      subCategory: 'Antibiotic',
      manufacturer: 'XYZ Pharma',
      description: 'Broad spectrum antibiotic',
      unit: 'capsule',
      strength: '250mg',
      form: 'capsule',
      batches: [{
        batchNumber: 'AMX001',
        manufacturingDate: new Date('2024-03-10'),
        expiryDate: new Date('2026-03-10'),
        quantity: 500,
        costPrice: 5,
        sellingPrice: 8,
        receivedDate: new Date('2024-03-15'),
        status: 'active'
      }],
      reorderLevel: 50,
      maxStockLevel: 1000,
      location: { rack: 'A', shelf: '2', bin: '1' },
      storageConditions: 'room_temperature',
      prescriptionRequired: true,
      createdBy: pharmacyUser._id
    }
  ];

  await Inventory.deleteMany({});
  const createdInventory = await Inventory.insertMany(inventoryItems);
  console.log(`Created ${createdInventory.length} inventory items`);
  return createdInventory;
};

const createSampleEquipment = async (users) => {
  console.log('Creating sample equipment...');
  const adminUser = users.find(u => u.role === 'admin') || users[0];
  
  const equipment = [
    {
      name: 'MRI Scanner 3T',
      type: 'Imaging',
      model: 'Signa Premier',
      manufacturer: 'GE Healthcare',
      serialNumber: 'GE-MRI-98274',
      location: 'Imaging Room A',
      status: 'operational',
      nextMaintenance: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      usageHours: 1250,
      maxUsageHours: 5000,
      createdBy: adminUser._id
    },
    {
      name: 'Hematology Analyzer',
      type: 'Laboratory',
      model: 'XN-3000',
      manufacturer: 'Sysmex',
      serialNumber: 'SY-HEM-87612',
      location: 'Pathology Lab 1',
      status: 'operational',
      nextMaintenance: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      usageHours: 850,
      maxUsageHours: 3000,
      createdBy: adminUser._id
    },
    {
      name: 'Ultrasound Machine',
      type: 'Imaging',
      model: 'Affiniti 70',
      manufacturer: 'Philips',
      serialNumber: 'PH-US-23412',
      location: 'OB/GYN Clinic',
      status: 'calibration',
      nextMaintenance: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      usageHours: 2100,
      maxUsageHours: 4000,
      createdBy: adminUser._id
    },
    {
      name: 'Electrocardiograph (ECG)',
      type: 'Cardiology',
      model: 'Mac 2000',
      manufacturer: 'GE Healthcare',
      serialNumber: 'GE-ECG-45123',
      location: 'Cardiology OPD',
      status: 'maintenance',
      nextMaintenance: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      usageHours: 3200,
      maxUsageHours: 5000,
      createdBy: adminUser._id
    }
  ];

  await Equipment.deleteMany({});
  const createdEquipment = await Equipment.insertMany(equipment);
  console.log(`Created ${createdEquipment.length} equipment items`);
  return createdEquipment;
};

const createSamplePrescriptions = async (users, patients) => {
  console.log('Creating sample prescriptions with follow-up dates...');
  const doctor = users.find(u => u.role === 'doctor') || users[0];
  
  const prescriptions = [
    {
      prescriptionNumber: 'RX000001',
      patientId: patients[0]._id,
      doctorId: doctor._id,
      medications: [
        { name: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '1 month' }
      ],
      diagnosis: 'Diabetes Mellitus Type 2',
      symptoms: ['Fatigue', 'Increased thirst'],
      advice: 'Avoid sweet food and exercise daily.',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      followUpInstructions: 'Routine fasting blood sugar level checkup',
      followUpStatus: 'pending',
      status: 'active',
      createdBy: doctor._id
    },
    {
      prescriptionNumber: 'RX000002',
      patientId: patients[1]._id,
      doctorId: doctor._id,
      medications: [
        { name: 'Amoxicillin 250mg', dosage: '1 capsule', frequency: 'Three times daily', duration: '7 days' }
      ],
      diagnosis: 'Acute Tonsillitis',
      symptoms: ['Sore throat', 'Fever'],
      advice: 'Drink warm water.',
      followUpDate: new Date(),
      followUpInstructions: 'Sore throat resolution assessment and vaccine schedule review',
      followUpStatus: 'pending',
      status: 'active',
      createdBy: doctor._id
    },
    {
      prescriptionNumber: 'RX000003',
      patientId: patients[2]._id,
      doctorId: doctor._id,
      medications: [
        { name: 'Telmisartan 40mg', dosage: '1 tablet', frequency: 'Once daily', duration: '3 months' }
      ],
      diagnosis: 'Essential Hypertension',
      symptoms: ['Headache', 'Dizziness'],
      advice: 'Low salt diet.',
      followUpDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      followUpInstructions: 'Blood pressure check after starting Telmisartan',
      followUpStatus: 'completed',
      status: 'active',
      createdBy: doctor._id
    }
  ];

  await Prescription.deleteMany({});
  const createdPrescriptions = await Prescription.insertMany(prescriptions);
  console.log(`Created ${createdPrescriptions.length} prescriptions`);
  return createdPrescriptions;
};

const createSampleMessages = async (users, patients) => {
  console.log('Creating sample message logs...');
  
  const messages = [
    {
      patientId: patients[0]._id,
      message: 'Dear Ramesh Kumar, your prescription has been created by Dr. Rajesh Sharma. Please check your patient dashboard.',
      type: 'prescription',
      status: 'read',
      channel: 'whatsapp',
      sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      patientId: patients[1]._id,
      message: 'Hi Meera Sharma, this is a reminder for your upcoming pediatric follow-up with Dr. Priya Patel today.',
      type: 'reminder',
      status: 'delivered',
      channel: 'whatsapp',
      sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    },
    {
      patientId: patients[2]._id,
      message: 'Dear Arjun Singh, your invoice inv-000001 is ready for payment. Total amount due is ₹900.',
      type: 'general',
      status: 'sent',
      channel: 'sms',
      sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  await Message.deleteMany({});
  const createdMessages = await Message.insertMany(messages);
  console.log(`Created ${createdMessages.length} message logs`);
  return createdMessages;
};

const createSampleInvoices = async (users, patients) => {
  console.log('Creating sample invoices...');
  const adminUser = users.find(u => u.role === 'admin') || users[0];
  
  const invoices = [
    {
      invoiceNumber: 'INV000001',
      patientId: patients[0]._id,
      services: [
        { name: 'General Consultation', price: 500, quantity: 1 },
        { name: 'ECG Test', price: 400, quantity: 1 }
      ],
      consultationFee: 500,
      subtotal: 900,
      discount: 0,
      discountAmount: 0,
      tax: 0,
      total: 900,
      status: 'paid',
      payments: [
        { amount: 900, paymentMethod: 'upi', transactionId: 'TXN87612348', recordedBy: adminUser._id, recordedAt: new Date() }
      ],
      createdBy: adminUser._id
    },
    {
      invoiceNumber: 'INV000002',
      patientId: patients[1]._id,
      services: [
        { name: 'Pediatric Consultation', price: 600, quantity: 1 }
      ],
      consultationFee: 600,
      subtotal: 600,
      discount: 10,
      discountAmount: 60,
      tax: 0,
      total: 540,
      status: 'pending',
      createdBy: adminUser._id
    }
  ];

  await Invoice.deleteMany({});
  const createdInvoices = await Invoice.insertMany(invoices);
  console.log(`Created ${createdInvoices.length} invoices`);
  return createdInvoices;
};

const populateDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Starting database population...');
    
    const users = await createSampleUsers();
    const patients = await createSamplePatients(users);
    const appointments = await createSampleAppointments(users, patients);
    const inventory = await createSampleInventory(users);
    await createSampleEquipment(users);
    await createSamplePrescriptions(users, patients);
    await createSampleMessages(users, patients);
    await createSampleInvoices(users, patients);
    
    console.log('Database population completed successfully!');
    console.log('\nSample login credentials:');
    console.log('Doctor: dr.sharma@hospital.com / password123');
    console.log('Receptionist: sunita@hospital.com / password123');
    console.log('Diagnostic: amit@hospital.com / password123');
    console.log('Pharmacy: ravi@hospital.com / password123');
    console.log('Admin: admin@hospital.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
};

populateDatabase();