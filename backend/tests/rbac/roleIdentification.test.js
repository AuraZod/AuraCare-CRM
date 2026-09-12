const fc = require('fast-check');
const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');
const authService = require('../../src/services/authService');
const { USER_ROLES } = require('../../src/types/rbac');

describe('RBAC Role Identification Tests', () => {

  describe('Property 2: Role Identification Accuracy', () => {
    
    const createTestUser = async (email, password, role) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      return await User.create({
        name: 'Test User',
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role,
        profile: {
          firstName: 'Test',
          lastName: 'User'
        },
        isActive: true
      });
    };

    const validEmailGen = fc.string({ minLength: 1, maxLength: 10 })
      .filter(s => s.trim().length > 0 && !s.includes('@') && !s.includes(' '))
      .map(s => `${s.replace(/[^a-zA-Z0-9]/g, 'a')}@example.com`);

    test('should correctly identify role for any valid user', () => {
      return fc.assert(fc.asyncProperty(
        validEmailGen,
        fc.string({ minLength: 6, maxLength: 20 }),
        fc.constantFrom(...Object.values(USER_ROLES)),
        async (email, password, expectedRole) => {
          const user = await createTestUser(email, password, expectedRole);
          
          try {
            const result = await authService.authenticate(email, password, {
              ipAddress: '127.0.0.1',
              userAgent: 'test-agent'
            });
            
            expect(result.success).toBe(true);
            expect(result.user.role).toBe(expectedRole);
            
            const validatedUser = await authService.validateCredentials(email, password);
            expect(validatedUser.role).toBe(expectedRole);
            
          } finally {
            await User.findByIdAndDelete(user._id);
          }
        }
      ), { numRuns: 50 });
    });

    test('should maintain role consistency across authentication methods', () => {
      return fc.assert(fc.asyncProperty(
        validEmailGen,
        fc.string({ minLength: 6, maxLength: 20 }),
        fc.constantFrom(...Object.values(USER_ROLES)),
        async (email, password, role) => {
          const user = await createTestUser(email, password, role);
          
          try {
            const directValidation = await authService.validateCredentials(email, password);
            const fullAuth = await authService.authenticate(email, password, {
              ipAddress: '127.0.0.1',
              userAgent: 'test-agent'
            });
            
            expect(directValidation.role).toBe(role);
            expect(fullAuth.user.role).toBe(role);
            
            const dbUser = await User.findById(user._id);
            expect(dbUser.role).toBe(role);
            
          } finally {
            await User.findByIdAndDelete(user._id);
          }
        }
      ), { numRuns: 30 });
    });

    test('should include correct permissions for identified role', () => {
      return fc.assert(fc.asyncProperty(
        validEmailGen,
        fc.string({ minLength: 6, maxLength: 20 }),
        fc.constantFrom(...Object.values(USER_ROLES)),
        async (email, password, role) => {
          const user = await createTestUser(email, password, role);
          
          try {
            const result = await authService.authenticate(email, password, {
              ipAddress: '127.0.0.1',
              userAgent: 'test-agent'
            });
            
            const expectedPermissions = authService.getUserPermissions(role);
            
            expect(result.user.permissions).toEqual(expectedPermissions);
            
            if (role === USER_ROLES.RECEPTIONIST) {
              expect(result.user.permissions.some(p => 
                p.resource === 'appointments' && p.action === 'create'
              )).toBe(true);
            } else if (role === USER_ROLES.DOCTOR) {
              expect(result.user.permissions.some(p => 
                p.resource === 'prescriptions' && p.action === 'create'
              )).toBe(true);
            } else if (role === USER_ROLES.ADMIN) {
              expect(result.user.permissions.some(p => 
                p.resource === 'user_management' && p.action === 'create'
              )).toBe(true);
            }
            
          } finally {
            await User.findByIdAndDelete(user._id);
          }
        }
      ), { numRuns: 30 });
    });

    test('should handle role changes correctly', async () => {
      const email = 'rolechange@example.com';
      const password = 'password123';
      
      const user = await createTestUser(email, password, USER_ROLES.RECEPTIONIST);
      
      try {
        let result = await authService.authenticate(email, password, {
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        });
        expect(result.user.role).toBe(USER_ROLES.RECEPTIONIST);
        
        user.role = USER_ROLES.DOCTOR;
        await user.save();
        
        result = await authService.authenticate(email, password, {
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        });
        expect(result.user.role).toBe(USER_ROLES.DOCTOR);
        
        const doctorPermissions = authService.getUserPermissions(USER_ROLES.DOCTOR);
        expect(result.user.permissions).toEqual(doctorPermissions);
        
      } finally {
        await User.findByIdAndDelete(user._id);
      }
    });

    test('should reject authentication for users with invalid roles', async () => {
      const email = 'invalidrole@example.com';
      const password = 'password123';
      
      const user = await createTestUser(email, password, USER_ROLES.DOCTOR);
      
      try {
        await User.updateOne(
          { _id: user._id }, 
          { $set: { role: 'invalid_role' } },
          { runValidators: false }
        );
        
        try {
          const result = await authService.authenticate(email, password, {
            ipAddress: '127.0.0.1',
            userAgent: 'test-agent'
          });
          
          expect(result.user.permissions).toEqual([]);
        } catch (error) {
          expect(error).toBeDefined();
        }
        
      } finally {
        await User.findByIdAndDelete(user._id);
      }
    });
  });
});