
const USER_ROLES = {
  RECEPTIONIST: 'receptionist',
  DOCTOR: 'doctor',
  DIAGNOSTIC: 'diagnostic',
  PHARMACY: 'pharmacy',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

const RESOURCES = {
  DASHBOARD: 'dashboard',
  APPOINTMENTS: 'appointments',
  PATIENTS: 'patients',
  QUEUE: 'queue',
  BILLING: 'billing',
  REPORTS: 'reports',
  PRESCRIPTIONS: 'prescriptions',
  CONSULTATION: 'consultation',
  ORDERS: 'orders',
  SCHEDULE: 'schedule',
  ANALYTICS: 'analytics',
  TEST_ORDERS: 'test_orders',
  EQUIPMENT_LOGS: 'equipment_logs',
  EQUIPMENT: 'equipment',
  INVENTORY: 'inventory',
  HOSPITAL_SETUP: 'hospital_setup',
  USER_MANAGEMENT: 'user_management',
  SERVICES_PRICING: 'services_pricing',
  BILLING_FINANCE: 'billing_finance',
  INTEGRATIONS: 'integrations',
  DATA_MANAGEMENT: 'data_management',
  EXECUTIVE_DASHBOARD: 'executive_dashboard',
  HOSPITAL_ANALYTICS: 'hospital_analytics',
  STAFF_PERFORMANCE: 'staff_performance',
  FINANCIAL_CONTROL: 'financial_control',
  COMPLIANCE_SECURITY: 'compliance_security',
  MASTER_SETTINGS: 'master_settings'
};

const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  VIEW: 'view',
  EDIT: 'edit',
  PRINT: 'print',
  EXPORT: 'export',
  APPROVE: 'approve',
  CANCEL: 'cancel',
  ASSIGN: 'assign',
  GENERATE: 'generate',
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
  CONFIGURE: 'configure'
};

const createPermission = (resource, action, conditions = null) => ({
  resource,
  action,
  conditions
});

const ROLE_PERMISSIONS = {
  [USER_ROLES.RECEPTIONIST]: [

    createPermission(RESOURCES.DASHBOARD, ACTIONS.VIEW),
    createPermission(RESOURCES.DASHBOARD, ACTIONS.CREATE),
    createPermission(RESOURCES.APPOINTMENTS, ACTIONS.VIEW),
    createPermission(RESOURCES.QUEUE, ACTIONS.VIEW),

    createPermission(RESOURCES.APPOINTMENTS, ACTIONS.CREATE),
    createPermission(RESOURCES.APPOINTMENTS, ACTIONS.READ),
    createPermission(RESOURCES.APPOINTMENTS, ACTIONS.UPDATE),
    createPermission(RESOURCES.APPOINTMENTS, ACTIONS.CANCEL),

    createPermission(RESOURCES.PATIENTS, ACTIONS.CREATE),
    createPermission(RESOURCES.PATIENTS, ACTIONS.READ),
    createPermission(RESOURCES.PATIENTS, ACTIONS.UPDATE, { scope: 'basic_info' }),

    createPermission(RESOURCES.QUEUE, ACTIONS.GENERATE),
    createPermission(RESOURCES.QUEUE, ACTIONS.ASSIGN),
    createPermission(RESOURCES.QUEUE, ACTIONS.UPDATE),

    createPermission(RESOURCES.BILLING, ACTIONS.CREATE, { type: 'consultation' }),
    createPermission(RESOURCES.BILLING, ACTIONS.PRINT),
    createPermission(RESOURCES.BILLING, ACTIONS.UPDATE, { action: 'mark_payment' }),
    createPermission(RESOURCES.BILLING, ACTIONS.EDIT, { isPastBill: false }),
    createPermission(RESOURCES.BILLING, ACTIONS.VIEW, { scope: 'pending_dues' }),

    createPermission(RESOURCES.REPORTS, ACTIONS.VIEW, { type: 'daily_appointments' }),
    createPermission(RESOURCES.REPORTS, ACTIONS.VIEW, { type: 'daily_collection' })
  ],

  [USER_ROLES.DOCTOR]: [

    createPermission(RESOURCES.DASHBOARD, ACTIONS.VIEW),
    createPermission(RESOURCES.PATIENTS, ACTIONS.VIEW, { scope: 'today' }),
    createPermission(RESOURCES.QUEUE, ACTIONS.VIEW),

    createPermission(RESOURCES.PATIENTS, ACTIONS.READ),
    createPermission(RESOURCES.PATIENTS, ACTIONS.VIEW, { scope: 'medical_history' }),
    createPermission(RESOURCES.PATIENTS, ACTIONS.VIEW, { scope: 'reports' }),

    createPermission(RESOURCES.CONSULTATION, ACTIONS.CREATE),
    createPermission(RESOURCES.CONSULTATION, ACTIONS.UPDATE),
    createPermission(RESOURCES.CONSULTATION, ACTIONS.READ),

    createPermission(RESOURCES.PRESCRIPTIONS, ACTIONS.CREATE),
    createPermission(RESOURCES.PRESCRIPTIONS, ACTIONS.UPDATE),
    createPermission(RESOURCES.PRESCRIPTIONS, ACTIONS.READ),
    createPermission(RESOURCES.PRESCRIPTIONS, ACTIONS.PRINT),

    createPermission(RESOURCES.ORDERS, ACTIONS.CREATE),
    createPermission(RESOURCES.ORDERS, ACTIONS.READ),

    createPermission(RESOURCES.SCHEDULE, ACTIONS.UPDATE, { scope: 'own' }),
    createPermission(RESOURCES.SCHEDULE, ACTIONS.READ, { scope: 'own' }),

    createPermission(RESOURCES.ANALYTICS, ACTIONS.VIEW, { scope: 'own_performance' })
  ],

  [USER_ROLES.DIAGNOSTIC]: [

    createPermission(RESOURCES.DASHBOARD, ACTIONS.VIEW),
    createPermission(RESOURCES.TEST_ORDERS, ACTIONS.VIEW),

    createPermission(RESOURCES.TEST_ORDERS, ACTIONS.READ),
    createPermission(RESOURCES.TEST_ORDERS, ACTIONS.UPDATE),
    createPermission(RESOURCES.TEST_ORDERS, ACTIONS.CREATE),

    createPermission(RESOURCES.REPORTS, ACTIONS.UPLOAD),
    createPermission(RESOURCES.REPORTS, ACTIONS.CREATE),
    createPermission(RESOURCES.REPORTS, ACTIONS.UPDATE),
    createPermission(RESOURCES.REPORTS, ACTIONS.VIEW),

    createPermission(RESOURCES.EQUIPMENT, ACTIONS.READ),
    createPermission(RESOURCES.EQUIPMENT, ACTIONS.UPDATE),
    createPermission(RESOURCES.EQUIPMENT, ACTIONS.CREATE),

    createPermission(RESOURCES.EQUIPMENT_LOGS, ACTIONS.VIEW),
    createPermission(RESOURCES.EQUIPMENT_LOGS, ACTIONS.UPDATE),

    createPermission(RESOURCES.BILLING, ACTIONS.CREATE, { type: 'test_charges' }),
    createPermission(RESOURCES.BILLING, ACTIONS.READ),
    createPermission(RESOURCES.BILLING, ACTIONS.PRINT)
  ],

  [USER_ROLES.PHARMACY]: [

    createPermission(RESOURCES.DASHBOARD, ACTIONS.VIEW),

    createPermission(RESOURCES.PRESCRIPTIONS, ACTIONS.READ),
    createPermission(RESOURCES.PRESCRIPTIONS, ACTIONS.UPDATE, { action: 'dispense' }),

    createPermission(RESOURCES.INVENTORY, ACTIONS.READ),
    createPermission(RESOURCES.INVENTORY, ACTIONS.UPDATE),
    createPermission(RESOURCES.INVENTORY, ACTIONS.CREATE),

    createPermission(RESOURCES.BILLING, ACTIONS.CREATE, { type: 'pharmacy' }),
    createPermission(RESOURCES.BILLING, ACTIONS.READ),
    createPermission(RESOURCES.BILLING, ACTIONS.PRINT),

    createPermission(RESOURCES.REPORTS, ACTIONS.VIEW, { type: 'pharmacy' })
  ],

  [USER_ROLES.ADMIN]: [

    createPermission(RESOURCES.HOSPITAL_SETUP, ACTIONS.CREATE),
    createPermission(RESOURCES.HOSPITAL_SETUP, ACTIONS.READ),
    createPermission(RESOURCES.HOSPITAL_SETUP, ACTIONS.UPDATE),

    createPermission(RESOURCES.USER_MANAGEMENT, ACTIONS.CREATE),
    createPermission(RESOURCES.USER_MANAGEMENT, ACTIONS.READ),
    createPermission(RESOURCES.USER_MANAGEMENT, ACTIONS.UPDATE),
    createPermission(RESOURCES.USER_MANAGEMENT, ACTIONS.DELETE),

    createPermission(RESOURCES.SERVICES_PRICING, ACTIONS.CREATE),
    createPermission(RESOURCES.SERVICES_PRICING, ACTIONS.READ),
    createPermission(RESOURCES.SERVICES_PRICING, ACTIONS.UPDATE),

    createPermission(RESOURCES.BILLING_FINANCE, ACTIONS.READ),
    createPermission(RESOURCES.BILLING_FINANCE, ACTIONS.EXPORT),

    createPermission(RESOURCES.INTEGRATIONS, ACTIONS.CONFIGURE),
    createPermission(RESOURCES.INTEGRATIONS, ACTIONS.READ),
    createPermission(RESOURCES.INTEGRATIONS, ACTIONS.UPDATE),

    createPermission(RESOURCES.DATA_MANAGEMENT, ACTIONS.EXPORT),
    createPermission(RESOURCES.DATA_MANAGEMENT, ACTIONS.READ)
  ],

  [USER_ROLES.SUPER_ADMIN]: []
};

ROLE_PERMISSIONS[USER_ROLES.SUPER_ADMIN] = [

  createPermission(RESOURCES.EXECUTIVE_DASHBOARD, ACTIONS.VIEW),

  createPermission(RESOURCES.HOSPITAL_ANALYTICS, ACTIONS.VIEW),
  createPermission(RESOURCES.HOSPITAL_ANALYTICS, ACTIONS.EXPORT),

  createPermission(RESOURCES.STAFF_PERFORMANCE, ACTIONS.VIEW),
  createPermission(RESOURCES.STAFF_PERFORMANCE, ACTIONS.EXPORT),

  createPermission(RESOURCES.FINANCIAL_CONTROL, ACTIONS.VIEW),
  createPermission(RESOURCES.FINANCIAL_CONTROL, ACTIONS.UPDATE),
  createPermission(RESOURCES.FINANCIAL_CONTROL, ACTIONS.APPROVE),

  createPermission(RESOURCES.COMPLIANCE_SECURITY, ACTIONS.VIEW),
  createPermission(RESOURCES.COMPLIANCE_SECURITY, ACTIONS.EXPORT),

  createPermission(RESOURCES.MASTER_SETTINGS, ACTIONS.CONFIGURE),
  createPermission(RESOURCES.MASTER_SETTINGS, ACTIONS.UPDATE),

  ...ROLE_PERMISSIONS[USER_ROLES.ADMIN]
];

const ROLE_RESTRICTIONS = {
  [USER_ROLES.RECEPTIONIST]: [
    { resource: RESOURCES.PRESCRIPTIONS, actions: [ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
    { resource: RESOURCES.BILLING, actions: [ACTIONS.EDIT], conditions: { scope: 'past_bills' } },
    { resource: RESOURCES.ANALYTICS, actions: [ACTIONS.VIEW], conditions: { scope: 'detailed' } }
  ],

  [USER_ROLES.DOCTOR]: [
    { resource: RESOURCES.BILLING_FINANCE, actions: [ACTIONS.VIEW], conditions: { scope: 'hospital_financials' } },
    { resource: RESOURCES.PATIENTS, actions: [ACTIONS.VIEW], conditions: { scope: 'other_doctors_data' } },
    { resource: RESOURCES.USER_MANAGEMENT, actions: [ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] }
  ],

  [USER_ROLES.DIAGNOSTIC]: [
    { resource: RESOURCES.PRESCRIPTIONS, actions: [ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE] },
    { resource: RESOURCES.ANALYTICS, actions: [ACTIONS.VIEW], conditions: { scope: 'hospital_profit' } }
  ],

  [USER_ROLES.PHARMACY]: [
    { resource: RESOURCES.PRESCRIPTIONS, actions: [ACTIONS.UPDATE], conditions: { scope: 'doctor_notes' } },
    { resource: RESOURCES.PATIENTS, actions: [ACTIONS.UPDATE], conditions: { scope: 'history' } }
  ]
};

module.exports = {
  USER_ROLES,
  RESOURCES,
  ACTIONS,
  ROLE_PERMISSIONS,
  ROLE_RESTRICTIONS,
  createPermission
};
