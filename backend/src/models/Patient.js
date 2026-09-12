const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  state: {
    type: String,
    required: false,
    trim: true,
    maxlength: 100
  },
  zipCode: {
    type: String,
    required: false,
    trim: true,
    maxlength: 20
  },
  country: {
    type: String,
    required: false,
    trim: true,
    maxlength: 100
  }
}, { _id: false });

const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    trim: true,
    maxlength: 100
  },
  relationship: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  }
}, { _id: false });

const medicalConditionSchema = new mongoose.Schema({
  condition: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  diagnosedDate: {
    type: Date,
    required: false
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe', 'critical'],
    lowercase: true,
    default: 'mild'
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'chronic', 'in_remission'],
    lowercase: true,
    default: 'active'
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, { timestamps: true });

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  dosage: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  frequency: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: false
  },
  prescribedBy: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200
  },
  purpose: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['active', 'discontinued', 'completed'],
    lowercase: true,
    default: 'active'
  },
  sideEffects: {
    type: [String],
    default: []
  }
}, { timestamps: true });

const surgerySchema = new mongoose.Schema({
  procedure: {
    type: String,
    required: false,
    trim: true,
    maxlength: 300
  },
  imageURL: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    required: false
  },
  surgeon: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200
  },
  hospital: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200
  },
  outcome: {
    type: String,
    enum: ['successful', 'complications', 'partial_success', 'failed'],
    lowercase: true,
    default: 'successful'
  },
  complications: {
    type: String,
    maxlength: 1000
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, { timestamps: true });

const immunizationSchema = new mongoose.Schema({
  vaccine: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200
  },
  imageURL: {
    type: String,
    required: false
  },
  dateAdministered: {
    type: Date,
    required: false
  },
  nextDueDate: {
    type: Date,
    required: false
  },
  administeredBy: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200
  },
  batchNumber: {
    type: String,
    required: false,
    trim: true,
    maxlength: 100
  },
  site: {
    type: String,
    required: false,
    trim: true,
    maxlength: 100
  },
  reactions: {
    type: [String],
    default: []
  }
}, { timestamps: true });

const familyHistorySchema = new mongoose.Schema({
  relation: {
    type: String,
    required: true,
    enum: ['father', 'mother', 'brother', 'sister', 'grandfather', 'grandmother', 'uncle', 'aunt', 'cousin', 'other'],
    lowercase: true
  },
  imageURL: {
    type: String,
    required: false
  },
  condition: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200
  },
  ageOfOnset: {
    type: Number,
    min: 0,
    max: 150
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, { timestamps: true });

const vitalSignsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  bloodPressure: {
    systolic: {
      type: Number,
      min: 50,
      max: 300
    },
    diastolic: {
      type: Number,
      min: 30,
      max: 200
    }
  },
  heartRate: {
    type: Number,
    min: 30,
    max: 250
  },
  temperature: {
    value: {
      type: Number,
      min: 90,
      max: 110
    },
    unit: {
      type: String,
      enum: ['fahrenheit', 'celsius'],
      default: 'fahrenheit'
    }
  },
  respiratoryRate: {
    type: Number,
    min: 5,
    max: 60
  },
  oxygenSaturation: {
    type: Number,
    min: 70,
    max: 100
  },
  weight: {
    value: {
      type: Number,
      min: 0,
      max: 1000
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'lbs'
    }
  },
  height: {
    value: {
      type: Number,
      min: 0,
      max: 300
    },
    unit: {
      type: String,
      enum: ['cm', 'inches'],
      default: 'inches'
    }
  },
  bmi: {
    type: Number,
    min: 10,
    max: 100
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, { timestamps: true });

const labResultSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200
  },
  imageURL: {
    type: String,
    required: false,
  },
  testDate: {
    type: Date,
    required: false
  },
  result: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500
  },
  normalRange: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200
  },
  unit: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50
  },
  status: {
    type: String,
    enum: ['normal', 'abnormal', 'critical', 'pending'],
    lowercase: true,
    default: 'normal'
  },
  orderedBy: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200
  },
  lab: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, { timestamps: true });

const medicalHistorySchema = new mongoose.Schema({

  conditions: [medicalConditionSchema],

  medications: [medicationSchema],

  surgeries: [surgerySchema],

  immunizations: [immunizationSchema],

  familyHistory: [familyHistorySchema],

  vitalSigns: [vitalSignsSchema],

  labResults: [labResultSchema],

  lifestyle: {
    smoking: {
      status: {
        type: String,
        enum: ['never', 'former', 'current'],
        default: 'never'
      },
      packsPerDay: {
        type: Number,
        min: 0,
        max: 10
      },
      yearsSmoked: {
        type: Number,
        min: 0,
        max: 100
      },
      quitDate: Date
    },
    alcohol: {
      status: {
        type: String,
        enum: ['never', 'occasional', 'moderate', 'heavy'],
        default: 'never'
      },
      drinksPerWeek: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    exercise: {
      frequency: {
        type: String,
        enum: ['never', 'rarely', 'weekly', 'daily'],
        default: 'never'
      },
      type: {
        type: [String],
        default: []
      },
      duration: {
        type: Number,
        min: 0,
        max: 480
      }
    },
    diet: {
      type: {
        type: String,
        enum: ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'other'],
        default: 'omnivore'
      },
      restrictions: {
        type: [String],
        default: []
      }
    }
  },

  insurance: {
    provider: {
      type: String,
      trim: true,
      maxlength: 200
    },
    policyNumber: {
      type: String,
      trim: true,
      maxlength: 100
    },
    groupNumber: {
      type: String,
      trim: true,
      maxlength: 100
    },
    effectiveDate: Date,
    expirationDate: Date
  },

  generalNotes: {
    type: String,
    maxlength: 5000
  },

  lastReviewDate: {
    type: Date,
    default: Date.now
  },
  lastReviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const paymentTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
    max: 1000000
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'],
    default: 'USD',
    uppercase: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'credit_card', 'debit_card', 'check', 'bank_transfer', 'insurance', 'online', 'mobile_payment'],
    lowercase: true
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    lowercase: true,
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  serviceDate: {
    type: Date,
    required: false
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refundAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  refundDate: {
    type: Date,
    required: false
  },
  refundReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, { timestamps: true });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid'],
    lowercase: true,
    default: 'draft'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  discountAmount: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  balanceAmount: {
    type: Number,
    required: false,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'],
    default: 'USD',
    uppercase: true
  },
  items: [{
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    serviceCode: {
      type: String,
      trim: true,
      maxlength: 50
    },
    serviceDate: {
      type: Date,
      required: false
    }
  }],
  paymentTerms: {
    type: String,
    trim: true,
    maxlength: 200,
    default: 'Net 30'
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const insuranceClaimSchema = new mongoose.Schema({
  claimNumber: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  insuranceProvider: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  policyNumber: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  claimDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  serviceDate: {
    type: Date,
    required: true
  },
  claimAmount: {
    type: Number,
    required: true,
    min: 0
  },
  approvedAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  paidAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  deductibleAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  copayAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'under_review', 'approved', 'denied', 'paid', 'partially_paid'],
    lowercase: true,
    default: 'submitted'
  },
  denialReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  services: [{
    serviceCode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    chargeAmount: {
      type: Number,
      required: true,
      min: 0
    },
    approvedAmount: {
      type: Number,
      min: 0,
      default: 0
    }
  }],
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, { timestamps: true });

const paymentPlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  downPayment: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  remainingAmount: {
    type: Number,
    required: true,
    min: 0
  },
  numberOfInstallments: {
    type: Number,
    required: true,
    min: 1,
    max: 60
  },
  installmentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  frequency: {
    type: String,
    required: true,
    enum: ['weekly', 'bi_weekly', 'monthly', 'quarterly', 'yearly'],
    lowercase: true,
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'completed', 'defaulted', 'cancelled'],
    lowercase: true,
    default: 'active'
  },
  interestRate: {
    type: Number,
    min: 0,
    max: 30,
    default: 0
  },
  installments: [{
    installmentNumber: {
      type: Number,
      required: true,
      min: 1
    },
    dueDate: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paidDate: {
      type: Date,
      required: false
    },
    paidAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'overdue', 'partial'],
      lowercase: true,
      default: 'pending'
    },
    lateFee: {
      type: Number,
      min: 0,
      default: 0
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, { timestamps: true });

const paymentsSchema = new mongoose.Schema({

  transactions: [paymentTransactionSchema],

  invoices: [invoiceSchema],

  insuranceClaims: [insuranceClaimSchema],

  paymentPlans: [paymentPlanSchema],

  financialSummary: {
    totalCharges: {
      type: Number,
      min: 0,
      default: 0
    },
    totalPayments: {
      type: Number,
      min: 0,
      default: 0
    },
    totalInsurancePayments: {
      type: Number,
      min: 0,
      default: 0
    },
    totalRefunds: {
      type: Number,
      min: 0,
      default: 0
    },
    outstandingBalance: {
      type: Number,
      default: 0
    },
    creditBalance: {
      type: Number,
      min: 0,
      default: 0
    },
    lastPaymentDate: {
      type: Date,
      required: false
    },
    lastPaymentAmount: {
      type: Number,
      min: 0,
      default: 0
    }
  },

  paymentPreferences: {
    preferredMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'check', 'bank_transfer', 'online', 'mobile_payment'],
      lowercase: true
    },
    autoPayEnabled: {
      type: Boolean,
      default: false
    },
    reminderPreference: {
      type: String,
      enum: ['email', 'sms', 'phone', 'mail', 'none'],
      lowercase: true,
      default: 'email'
    },
    statementFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually'],
      lowercase: true,
      default: 'monthly'
    }
  },

  creditInfo: {
    creditLimit: {
      type: Number,
      min: 0,
      default: 0
    },
    creditUsed: {
      type: Number,
      min: 0,
      default: 0
    },
    creditScore: {
      type: Number,
      min: 300,
      max: 850
    },
    paymentHistory: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      lowercase: true
    }
  },

  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const patientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50
  },

  dateOfBirth: {
    type: Date,
    required: true
  },

  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  address: {
    type: addressSchema,
    required: true
  },
  emergencyContact: {
    type: emergencyContactSchema,
    required: false
  },
  medicalHistory: {
    type: medicalHistorySchema,
    default: () => ({}),
    required: false
  },
  payments: {
    type: paymentsSchema,
    default: () => ({}),
    required: false
  },
  allergies: {
    type: [String],
    default: [],
    required: false
  },

  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: false
  },
  occupation: {
    type: String,
    trim: true,
    maxlength: 100,
    required: false
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed'],
    lowercase: true,
    required: false
  },
  notes: {
    type: String,
    maxlength: 2000,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  collection: 'patients'
});

patientSchema.index({ firstName: 1, lastName: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ email: 1 });
patientSchema.index({ createdBy: 1 });
patientSchema.index({ isActive: 1 });
patientSchema.index({ 'address.city': 1, 'address.state': 1 });
patientSchema.index({ dateOfBirth: 1 });
patientSchema.index({ 'medicalHistory.conditions.condition': 1 });
patientSchema.index({ 'medicalHistory.medications.name': 1 });
patientSchema.index({ 'medicalHistory.lastReviewDate': 1 });
patientSchema.index({ 'payments.transactions.transactionId': 1 }, { sparse: true });
patientSchema.index({ 'payments.invoices.invoiceNumber': 1 }, { sparse: true });
patientSchema.index({ 'payments.invoices.status': 1 });
patientSchema.index({ 'payments.insuranceClaims.claimNumber': 1 }, { sparse: true });
patientSchema.index({ 'payments.financialSummary.outstandingBalance': 1 });

patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

patientSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
});

patientSchema.virtual('activeConditions').get(function() {
  return this.medicalHistory?.conditions?.filter(condition => condition.status === 'active') || [];
});

patientSchema.virtual('currentMedications').get(function() {
  return this.medicalHistory?.medications?.filter(medication => medication.status === 'active') || [];
});

patientSchema.virtual('outstandingBalance').get(function() {
  return this.payments?.financialSummary?.outstandingBalance || 0;
});

patientSchema.virtual('totalPaymentsMade').get(function() {
  return this.payments?.financialSummary?.totalPayments || 0;
});

patientSchema.virtual('activePaymentPlans').get(function() {
  return this.payments?.paymentPlans?.filter(plan => plan.status === 'active') || [];
});

patientSchema.virtual('pendingInvoices').get(function() {
  return this.payments?.invoices?.filter(invoice => ['sent', 'overdue', 'partially_paid'].includes(invoice.status)) || [];
});

patientSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Patient', patientSchema);
