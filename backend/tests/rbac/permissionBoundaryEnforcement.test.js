const fc = require('fast-check');
const authorizationService = require('../../src/services/authorizationService');
const { USER_ROLES, RESOURCES, ACTIONS, ROLE_RESTRICTIONS } = require('../../src/types/rbac');

describe('Property Test: Permission Boundary Enforcement', () => {

  test('should enforce permission boundaries consistently', () => {
    const roleArb = fc.constantFrom(...Object.values(USER_ROLES));
    const resourceArb = fc.constantFrom(...Object.values(RESOURCES));
    const actionArb = fc.constantFrom(...Object.values(ACTIONS));

    fc.assert(
      fc.property(
        roleArb,
        resourceArb,
        actionArb,
        (role, resource, action) => {
          const roleRestrictions = ROLE_RESTRICTIONS[role] || [];
          const isExplicitlyRestricted = roleRestrictions.some(restriction =>
            restriction.resource === resource && restriction.actions.includes(action)
          );

          if (isExplicitlyRestricted) {
            const hasPermission = authorizationService.hasPermission(role, resource, action);
            expect(hasPermission).toBe(false, 
              `Role ${role} should be restricted from ${resource}:${action}`);
          }

          const hasPermission = authorizationService.hasPermission(role, resource, action);
          const hasPermission2 = authorizationService.hasPermission(role, resource, action);
          expect(hasPermission).toBe(hasPermission2,
            `Permission check should be consistent for ${role}:${resource}:${action}`);
        }
      ),
      { numRuns: 100, timeout: 5000 }
    );
  });


  test('should enforce async permission boundaries consistently', async () => {
    const testCases = [
      { role: USER_ROLES.RECEPTIONIST, resource: RESOURCES.PRESCRIPTIONS, action: ACTIONS.CREATE, shouldAllow: false },
      { role: USER_ROLES.DOCTOR, resource: RESOURCES.BILLING_FINANCE, action: ACTIONS.VIEW, shouldAllow: false },
      { role: USER_ROLES.DIAGNOSTIC, resource: RESOURCES.PRESCRIPTIONS, action: ACTIONS.UPDATE, shouldAllow: false },
      { role: USER_ROLES.PHARMACY, resource: RESOURCES.PRESCRIPTIONS, action: ACTIONS.READ, shouldAllow: true }
    ];

    for (const { role, resource, action, shouldAllow } of testCases) {
      const userId = 'test-user-id';
      const hasPermission = authorizationService.hasPermission(role, resource, action);
      const canAccess = await authorizationService.canAccessResource(userId, role, resource, action);

      expect(hasPermission).toBe(shouldAllow, 
        `hasPermission should be ${shouldAllow} for ${role}:${resource}:${action}`);
      expect(canAccess).toBe(shouldAllow,
        `canAccessResource should be ${shouldAllow} for ${role}:${resource}:${action}`);
      expect(hasPermission).toBe(canAccess,
        `Both methods should agree for ${role}:${resource}:${action}`);
    }
  });


  test('should enforce role-specific boundaries', async () => {
    const testScenarios = [
      {
        description: 'Receptionist boundaries',
        role: USER_ROLES.RECEPTIONIST,
        deniedAccess: [
          { resource: RESOURCES.PRESCRIPTIONS, action: ACTIONS.CREATE },
          { resource: RESOURCES.PRESCRIPTIONS, action: ACTIONS.UPDATE },
          { resource: RESOURCES.PRESCRIPTIONS, action: ACTIONS.DELETE },
          { resource: RESOURCES.ANALYTICS, action: ACTIONS.VIEW }
        ]
      },
      {
        description: 'Doctor boundaries',
        role: USER_ROLES.DOCTOR,
        deniedAccess: [
          { resource: RESOURCES.BILLING_FINANCE, action: ACTIONS.VIEW },
          { resource: RESOURCES.USER_MANAGEMENT, action: ACTIONS.CREATE },
          { resource: RESOURCES.USER_MANAGEMENT, action: ACTIONS.UPDATE },
          { resource: RESOURCES.USER_MANAGEMENT, action: ACTIONS.DELETE }
        ]
      },
      {
        description: 'Diagnostic staff boundaries',
        role: USER_ROLES.DIAGNOSTIC,
        deniedAccess: [
          { resource: RESOURCES.PRESCRIPTIONS, action: ACTIONS.CREATE },
          { resource: RESOURCES.PRESCRIPTIONS, action: ACTIONS.UPDATE },
          { resource: RESOURCES.PRESCRIPTIONS, action: ACTIONS.DELETE },
          { resource: RESOURCES.ANALYTICS, action: ACTIONS.VIEW }
        ]
      },
      {
        description: 'Pharmacy boundaries',
        role: USER_ROLES.PHARMACY,
        deniedAccess: [
          { resource: RESOURCES.PATIENTS, action: ACTIONS.UPDATE }
        ]
      }
    ];

    for (const scenario of testScenarios) {
      for (const deniedAction of scenario.deniedAccess) {
        const hasPermission = authorizationService.hasPermission(
          scenario.role,
          deniedAction.resource,
          deniedAction.action
        );

        const canAccess = await authorizationService.canAccessResource(
          'test-user-id',
          scenario.role,
          deniedAction.resource,
          deniedAction.action
        );

        expect(hasPermission).toBe(false,
          `${scenario.description}: Should deny ${deniedAction.resource}:${deniedAction.action}`);
        expect(canAccess).toBe(false,
          `${scenario.description}: Should not allow access to ${deniedAction.resource}:${deniedAction.action}`);
      }
    }
  });


  test('should maintain cross-role data isolation', async () => {
    const doctorUserId = 'doctor-123';
    const otherDoctorUserId = 'doctor-456';
    const receptionistUserId = 'receptionist-789';

    const doctorCanAccessOwnSchedule = await authorizationService.canAccessResource(
      doctorUserId,
      USER_ROLES.DOCTOR,
      RESOURCES.SCHEDULE,
      ACTIONS.UPDATE,
      { scope: 'own', doctorId: doctorUserId }
    );

    const doctorCanAccessOtherSchedule = await authorizationService.canAccessResource(
      doctorUserId,
      USER_ROLES.DOCTOR,
      RESOURCES.SCHEDULE,
      ACTIONS.UPDATE,
      { scope: 'own', doctorId: otherDoctorUserId }
    );

    expect(doctorCanAccessOwnSchedule).toBe(true,
      'Doctor should be able to access their own schedule');
    expect(doctorCanAccessOtherSchedule).toBe(false,
      'Doctor should not be able to access another doctor\'s schedule');

    const receptionistCanCreateBill = await authorizationService.canAccessResource(
      receptionistUserId,
      USER_ROLES.RECEPTIONIST,
      RESOURCES.BILLING,
      ACTIONS.CREATE,
      { type: 'consultation' }
    );

    const receptionistCanEditPastBill = await authorizationService.canAccessResource(
      receptionistUserId,
      USER_ROLES.RECEPTIONIST,
      RESOURCES.BILLING,
      ACTIONS.EDIT,
      { isPastBill: true }
    );

    expect(receptionistCanCreateBill).toBe(true,
      'Receptionist should be able to create consultation bills');
    expect(receptionistCanEditPastBill).toBe(false,
      'Receptionist should not be able to edit past bills');
  });


  test('should prevent permission escalation', () => {
    const lowerRoles = [USER_ROLES.RECEPTIONIST, USER_ROLES.DOCTOR, USER_ROLES.DIAGNOSTIC, USER_ROLES.PHARMACY];
    const higherPrivilegeActions = [
      { resource: RESOURCES.USER_MANAGEMENT, action: ACTIONS.CREATE },
      { resource: RESOURCES.USER_MANAGEMENT, action: ACTIONS.DELETE },
      { resource: RESOURCES.MASTER_SETTINGS, action: ACTIONS.CONFIGURE },
      { resource: RESOURCES.FINANCIAL_CONTROL, action: ACTIONS.APPROVE }
    ];

    lowerRoles.forEach(role => {
      higherPrivilegeActions.forEach(({ resource, action }) => {
        const hasPermission = authorizationService.hasPermission(role, resource, action);
        expect(hasPermission).toBe(false,
          `Role ${role} should not have permission for ${resource}:${action}`);
      });
    });
  });


  test('should enforce boundaries with conditional access', () => {
    const conditionTestCases = [
      {
        role: USER_ROLES.RECEPTIONIST,
        resource: RESOURCES.BILLING,
        action: ACTIONS.UPDATE,
        validConditions: { action: 'mark_payment' },
        invalidConditions: { action: 'edit_amount' },
        description: 'Receptionist billing update conditions'
      },
      {
        role: USER_ROLES.PHARMACY,
        resource: RESOURCES.PRESCRIPTIONS,
        action: ACTIONS.UPDATE,
        validConditions: { action: 'dispense' },
        invalidConditions: { scope: 'doctor_notes' },
        description: 'Pharmacy prescription update conditions'
      }
    ];

    conditionTestCases.forEach(({ role, resource, action, validConditions, invalidConditions, description }) => {
      const hasValidPermission = authorizationService.hasPermission(role, resource, action, validConditions);
      const hasInvalidPermission = authorizationService.hasPermission(role, resource, action, invalidConditions);

      expect(typeof hasValidPermission).toBe('boolean', `${description}: Valid conditions should return boolean`);
      expect(typeof hasInvalidPermission).toBe('boolean', `${description}: Invalid conditions should return boolean`);
    });
  });


  test('should enforce temporal boundaries', async () => {
    const userId = 'test-user-id';
    
    const receptionistCanEditCurrentBill = await authorizationService.canAccessResource(
      userId,
      USER_ROLES.RECEPTIONIST,
      RESOURCES.BILLING,
      ACTIONS.EDIT,
      { isPastBill: false }
    );

    const receptionistCanEditPastBill = await authorizationService.canAccessResource(
      userId,
      USER_ROLES.RECEPTIONIST,
      RESOURCES.BILLING,
      ACTIONS.EDIT,
      { isPastBill: true }
    );

    expect(receptionistCanEditCurrentBill).toBe(true,
      'Receptionist should be able to edit current bills');
    expect(receptionistCanEditPastBill).toBe(false,
      'Receptionist should not be able to edit past bills');
  });


  test('should enforce resource-specific boundaries', () => {
    const resourceBoundaryTests = [
      {
        role: USER_ROLES.DIAGNOSTIC,
        allowedResources: [RESOURCES.TEST_ORDERS, RESOURCES.REPORTS, RESOURCES.EQUIPMENT_LOGS],
        deniedResources: [RESOURCES.PRESCRIPTIONS, RESOURCES.USER_MANAGEMENT, RESOURCES.FINANCIAL_CONTROL]
      },
      {
        role: USER_ROLES.PHARMACY,
        allowedResources: [RESOURCES.PRESCRIPTIONS, RESOURCES.INVENTORY, RESOURCES.BILLING],
        deniedResources: [RESOURCES.USER_MANAGEMENT, RESOURCES.HOSPITAL_SETUP, RESOURCES.ANALYTICS]
      }
    ];

    resourceBoundaryTests.forEach(({ role, allowedResources, deniedResources }) => {
      allowedResources.forEach(resource => {
        const hasAnyPermission = Object.values(ACTIONS).some(action =>
          authorizationService.hasPermission(role, resource, action)
        );
        expect(typeof hasAnyPermission).toBe('boolean',
          `Role ${role} should have boolean response for allowed resource ${resource}`);
      });

      deniedResources.forEach(resource => {
        Object.values(ACTIONS).forEach(action => {
          const hasPermission = authorizationService.hasPermission(role, resource, action);
          expect(hasPermission).toBe(false,
            `Role ${role} should be denied ${resource}:${action}`);
        });
      });
    });
  });
});