const fc = require('fast-check');
const authorizationService = require('../../src/services/authorizationService');
const { USER_ROLES, RESOURCES, ACTIONS, ROLE_PERMISSIONS, ROLE_RESTRICTIONS } = require('../../src/types/rbac');

describe('Property Test: Role-Based Access Control', () => {

  test('should consistently enforce role-based access control', () => {
    const roleArb = fc.constantFrom(...Object.values(USER_ROLES));
    const resourceArb = fc.constantFrom(...Object.values(RESOURCES));
    const actionArb = fc.constantFrom(...Object.values(ACTIONS));
    const userIdArb = fc.uuid();

    fc.assert(
      fc.property(
        roleArb,
        resourceArb,
        actionArb,
        userIdArb,
        (role, resource, action, userId) => {
          const hasPermission = authorizationService.hasPermission(role, resource, action);

          const rolePermissions = ROLE_PERMISSIONS[role] || [];
          const hasExplicitPermission = rolePermissions.some(perm => 
            perm.resource === resource && perm.action === action
          );

          const roleRestrictions = ROLE_RESTRICTIONS[role] || [];
          const isRestricted = roleRestrictions.some(restriction =>
            restriction.resource === resource && restriction.actions.includes(action)
          );

          if (isRestricted) {
            expect(hasPermission).toBe(false);
          }

          if (!hasExplicitPermission && !isRestricted) {
            expect(hasPermission).toBe(false);
          }

          if (hasExplicitPermission && !isRestricted) {
            expect(hasPermission).toBe(true);
          }

          const hasPermission2 = authorizationService.hasPermission(role, resource, action);
          expect(hasPermission).toBe(hasPermission2);
        }
      ),
      { numRuns: 100, timeout: 5000 }
    );
  });

  test('should consistently enforce async resource access control', async () => {
    const testCases = [
      { role: USER_ROLES.RECEPTIONIST, resource: RESOURCES.DASHBOARD, action: ACTIONS.CREATE },
      { role: USER_ROLES.RECEPTIONIST, resource: RESOURCES.DASHBOARD, action: ACTIONS.VIEW },
      { role: USER_ROLES.DOCTOR, resource: RESOURCES.PRESCRIPTIONS, action: ACTIONS.CREATE },
      { role: USER_ROLES.DIAGNOSTIC, resource: RESOURCES.REPORTS, action: ACTIONS.UPLOAD },
      { role: USER_ROLES.PHARMACY, resource: RESOURCES.INVENTORY, action: ACTIONS.UPDATE }
    ];

    for (const { role, resource, action } of testCases) {
      const userId = 'test-user-id';
      const hasPermission = authorizationService.hasPermission(role, resource, action);
      const canAccess = await authorizationService.canAccessResource(userId, role, resource, action);

      expect(hasPermission).toBe(canAccess, 
        `Permission methods should agree for ${role}:${resource}:${action}`);
    }
  });

  test('should enforce specific role restrictions correctly', () => {
    const testCases = [
      {
        role: USER_ROLES.RECEPTIONIST,
        resource: RESOURCES.PRESCRIPTIONS,
        action: ACTIONS.CREATE,
        shouldHaveAccess: false,
        reason: 'Receptionists cannot create prescriptions'
      },
      {
        role: USER_ROLES.RECEPTIONIST,
        resource: RESOURCES.ANALYTICS,
        action: ACTIONS.VIEW,
        shouldHaveAccess: false,
        reason: 'Receptionists cannot view detailed analytics'
      },
      
      {
        role: USER_ROLES.DOCTOR,
        resource: RESOURCES.PRESCRIPTIONS,
        action: ACTIONS.CREATE,
        shouldHaveAccess: true,
        reason: 'Doctors can create prescriptions'
      },
      {
        role: USER_ROLES.DOCTOR,
        resource: RESOURCES.BILLING_FINANCE,
        action: ACTIONS.VIEW,
        shouldHaveAccess: false,
        reason: 'Doctors cannot view hospital financials'
      },
      
      {
        role: USER_ROLES.DIAGNOSTIC,
        resource: RESOURCES.PRESCRIPTIONS,
        action: ACTIONS.UPDATE,
        shouldHaveAccess: false,
        reason: 'Diagnostic staff cannot edit prescriptions'
      },
      {
        role: USER_ROLES.DIAGNOSTIC,
        resource: RESOURCES.REPORTS,
        action: ACTIONS.UPLOAD,
        shouldHaveAccess: true,
        reason: 'Diagnostic staff can upload reports'
      },
      
      {
        role: USER_ROLES.PHARMACY,
        resource: RESOURCES.PRESCRIPTIONS,
        action: ACTIONS.READ,
        shouldHaveAccess: true,
        reason: 'Pharmacy staff can read prescriptions'
      },
      {
        role: USER_ROLES.PHARMACY,
        resource: RESOURCES.INVENTORY,
        action: ACTIONS.UPDATE,
        shouldHaveAccess: true,
        reason: 'Pharmacy staff can update inventory'
      },
      
      {
        role: USER_ROLES.ADMIN,
        resource: RESOURCES.USER_MANAGEMENT,
        action: ACTIONS.CREATE,
        shouldHaveAccess: true,
        reason: 'Admins can create users'
      },
      
      {
        role: USER_ROLES.SUPER_ADMIN,
        resource: RESOURCES.MASTER_SETTINGS,
        action: ACTIONS.CONFIGURE,
        shouldHaveAccess: true,
        reason: 'Super admins can configure master settings'
      }
    ];

    testCases.forEach(({ role, resource, action, shouldHaveAccess, reason }) => {
      const hasPermission = authorizationService.hasPermission(role, resource, action);
      expect(hasPermission).toBe(shouldHaveAccess, reason);
    });
  });

  test('should handle role hierarchy correctly', async () => {
    const userId = 'test-user-id';

    const adminPermissions = ROLE_PERMISSIONS[USER_ROLES.ADMIN];
    
    for (const permission of adminPermissions) {
      const superAdminHasPermission = authorizationService.hasPermission(
        USER_ROLES.SUPER_ADMIN,
        permission.resource,
        permission.action
      );
      
      const superAdminCanAccess = await authorizationService.canAccessResource(
        userId,
        USER_ROLES.SUPER_ADMIN,
        permission.resource,
        permission.action
      );

      expect(superAdminHasPermission).toBe(true, 
        `Super Admin should have ${permission.resource}:${permission.action} permission`);
      expect(superAdminCanAccess).toBe(true,
        `Super Admin should be able to access ${permission.resource}:${permission.action}`);
    }
  });

  test('should handle conditional permissions correctly', () => {
    const conditionArb = fc.record({
      scope: fc.constantFrom('basic_info', 'medical_history', 'own', 'pending_dues'),
      type: fc.constantFrom('consultation', 'pharmacy', 'daily_appointments'),
      action: fc.constantFrom('mark_payment', 'dispense')
    });

    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(USER_ROLES)),
        fc.constantFrom(...Object.values(RESOURCES)),
        fc.constantFrom(...Object.values(ACTIONS)),
        conditionArb,
        (role, resource, action, conditions) => {
          const hasPermissionWithConditions = authorizationService.hasPermission(
            role, resource, action, conditions
          );
          const hasPermissionWithoutConditions = authorizationService.hasPermission(
            role, resource, action
          );

          if (!hasPermissionWithoutConditions) {
            expect(typeof hasPermissionWithConditions).toBe('boolean');
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('should handle invalid inputs gracefully', () => {
    expect(() => {
      authorizationService.hasPermission('invalid_role', RESOURCES.DASHBOARD, ACTIONS.VIEW);
    }).not.toThrow();

    expect(() => {
      authorizationService.hasPermission(USER_ROLES.DOCTOR, 'invalid_resource', ACTIONS.VIEW);
    }).not.toThrow();

    expect(() => {
      authorizationService.hasPermission(USER_ROLES.DOCTOR, RESOURCES.DASHBOARD, 'invalid_action');
    }).not.toThrow();

    expect(() => {
      authorizationService.hasPermission(null, RESOURCES.DASHBOARD, ACTIONS.VIEW);
    }).not.toThrow();

    expect(() => {
      authorizationService.hasPermission(USER_ROLES.DOCTOR, null, ACTIONS.VIEW);
    }).not.toThrow();

    expect(() => {
      authorizationService.hasPermission(USER_ROLES.DOCTOR, RESOURCES.DASHBOARD, null);
    }).not.toThrow();
  });
});