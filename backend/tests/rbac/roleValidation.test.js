const fc = require('fast-check');
const { USER_ROLES } = require('../../src/types/rbac');

describe('RBAC Role Validation Tests', () => {

  describe('Property 4: Role Set Completeness', () => {
    
    const isValidRole = (role) => {
      return Object.values(USER_ROLES).includes(role);
    };
    
    const assignRole = (role) => {
      if (!isValidRole(role)) {
        throw new Error(`Invalid role: ${role}`);
      }
      return { success: true, role };
    };
    
    test('should accept only the six defined roles', () => {
      fc.assert(fc.property(
        fc.constantFrom(...Object.values(USER_ROLES)),
        (role) => {
          const result = assignRole(role);
          
          expect(result.success).toBe(true);
          expect(result.role).toBe(role);
          expect(isValidRole(role)).toBe(true);
        }
      ), { numRuns: 100 });
    });
    
    test('should reject any role not in the defined set', () => {
      fc.assert(fc.property(
        fc.string().filter(str => !Object.values(USER_ROLES).includes(str)),
        (invalidRole) => {
          expect(() => assignRole(invalidRole)).toThrow();
          expect(isValidRole(invalidRole)).toBe(false);
        }
      ), { numRuns: 100 });
    });
    
    test('should have exactly six roles defined', () => {
      const roleCount = Object.keys(USER_ROLES).length;
      expect(roleCount).toBe(6);
      
      expect(USER_ROLES.RECEPTIONIST).toBe('receptionist');
      expect(USER_ROLES.DOCTOR).toBe('doctor');
      expect(USER_ROLES.DIAGNOSTIC).toBe('diagnostic');
      expect(USER_ROLES.PHARMACY).toBe('pharmacy');
      expect(USER_ROLES.ADMIN).toBe('admin');
      expect(USER_ROLES.SUPER_ADMIN).toBe('super_admin');
    });
    
    test('role values should be consistent with enum keys', () => {
      fc.assert(fc.property(
        fc.constantFrom(...Object.keys(USER_ROLES)),
        (roleKey) => {
          const expectedValue = roleKey.toLowerCase();
          const actualValue = USER_ROLES[roleKey];
          
          if (roleKey === 'SUPER_ADMIN') {
            expect(actualValue).toBe('super_admin');
          } else {
            expect(actualValue).toBe(expectedValue);
          }
        }
      ), { numRuns: 100 });
    });
  });
});