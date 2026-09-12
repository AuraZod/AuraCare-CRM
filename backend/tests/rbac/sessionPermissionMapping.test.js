const fc = require('fast-check');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');
const authService = require('../../src/services/authService');
const { USER_ROLES } = require('../../src/types/rbac');
const config = require('../../src/config');

describe('RBAC Session Permission Mapping Tests', () => {

  describe('Property 3: Session Permission Mapping', () => {
    
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

    test('should create session with correct role-specific permissions', () => {
      return fc.assert(fc.asyncProperty(
        validEmailGen,
        fc.string({ minLength: 6, maxLength: 20 }),
        fc.constantFrom(...Object.values(USER_ROLES)),
        async (email, password, role) => {
          const user = await createTestUser(email, password, role);
          
          try {
            const authResult = await authService.authenticate(email, password, {
              ipAddress: '127.0.0.1',
              userAgent: 'test-agent'
            });
            
            const decoded = jwt.verify(authResult.accessToken, config.JWT_SECRET);
            
            const expectedPermissions = authService.getUserPermissions(role);
            const expectedPermissionStrings = expectedPermissions.map(p => `${p.resource}:${p.action}`);
            
            expect(decoded.permissions).toEqual(expectedPermissionStrings);
            expect(decoded.role).toBe(role);
            
            expect(authResult.user.permissions).toEqual(expectedPermissions);
            expect(authResult.user.role).toBe(role);
            
          } finally {
            await User.findByIdAndDelete(user._id);
          }
        }
      ), { numRuns: 50 });
    });

    test('should maintain permission consistency across token generation', () => {
      return fc.assert(fc.asyncProperty(
        validEmailGen,
        fc.string({ minLength: 6, maxLength: 20 }),
        fc.constantFrom(...Object.values(USER_ROLES)),
        async (email, password, role) => {
          const user = await createTestUser(email, password, role);
          
          try {
            const tokens1 = await authService.generateTokens(user);
            const tokens2 = await authService.generateTokens(user);
            
            const decoded1 = jwt.verify(tokens1.accessToken, config.JWT_SECRET);
            const decoded2 = jwt.verify(tokens2.accessToken, config.JWT_SECRET);
            
            expect(decoded1.permissions).toEqual(decoded2.permissions);
            expect(decoded1.role).toBe(decoded2.role);
            expect(decoded1.role).toBe(role);
            
            const expectedPermissions = authService.getUserPermissions(role);
            const expectedPermissionStrings = expectedPermissions.map(p => `${p.resource}:${p.action}`);
            expect(decoded1.permissions).toEqual(expectedPermissionStrings);
            
          } finally {
            await User.findByIdAndDelete(user._id);
          }
        }
      ), { numRuns: 30 });
    });

    test('should include all required session metadata', () => {
      return fc.assert(fc.asyncProperty(
        validEmailGen,
        fc.string({ minLength: 6, maxLength: 20 }),
        fc.constantFrom(...Object.values(USER_ROLES)),
        async (email, password, role) => {
          const user = await createTestUser(email, password, role);
          
          try {
            const requestInfo = {
              ipAddress: '192.168.1.100',
              userAgent: 'Mozilla/5.0 Test Browser'
            };
            
            const authResult = await authService.authenticate(email, password, requestInfo);
            
            const decoded = jwt.verify(authResult.accessToken, config.JWT_SECRET);
            
            expect(decoded.id).toBe(user._id.toString());
            expect(decoded.email).toBe(email.toLowerCase());
            expect(decoded.role).toBe(role);
            expect(decoded.permissions).toBeDefined();
            expect(Array.isArray(decoded.permissions)).toBe(true);
            expect(decoded.jti).toBeDefined();
            expect(decoded.iss).toBe('hospital-crm');
            expect(decoded.aud).toBe('hospital-staff');
            expect(decoded.iat).toBeDefined();
            expect(decoded.exp).toBeDefined();
            
            expect(decoded.exp * 1000).toBeGreaterThan(Date.now());
            
          } finally {
            await User.findByIdAndDelete(user._id);
          }
        }
      ), { numRuns: 30 });
    });

    test('should handle permission changes when role changes', async () => {
      const email = 'permchange@example.com';
      const password = 'password123';
      
      const user = await createTestUser(email, password, USER_ROLES.RECEPTIONIST);
      
      try {
        const initialAuth = await authService.authenticate(email, password, {
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        });
        const initialDecoded = jwt.verify(initialAuth.accessToken, config.JWT_SECRET);
        const receptionistPermissions = authService.getUserPermissions(USER_ROLES.RECEPTIONIST);
        const receptionistPermissionStrings = receptionistPermissions.map(p => `${p.resource}:${p.action}`);
        
        expect(initialDecoded.permissions).toEqual(receptionistPermissionStrings);
        expect(initialDecoded.role).toBe(USER_ROLES.RECEPTIONIST);
        
        user.role = USER_ROLES.DOCTOR;
        await user.save();
        
        const newAuth = await authService.authenticate(email, password, {
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        });
        const newDecoded = jwt.verify(newAuth.accessToken, config.JWT_SECRET);
        const doctorPermissions = authService.getUserPermissions(USER_ROLES.DOCTOR);
        const doctorPermissionStrings = doctorPermissions.map(p => `${p.resource}:${p.action}`);
        
        expect(newDecoded.permissions).toEqual(doctorPermissionStrings);
        expect(newDecoded.role).toBe(USER_ROLES.DOCTOR);
        
        expect(newDecoded.permissions).not.toEqual(initialDecoded.permissions);
        
      } finally {
        await User.findByIdAndDelete(user._id);
      }
    });

    test('should create unique sessions for different users', () => {
      return fc.assert(fc.asyncProperty(
        fc.tuple(validEmailGen, validEmailGen).filter(([email1, email2]) => email1 !== email2),
        fc.string({ minLength: 6, maxLength: 20 }),
        fc.constantFrom(...Object.values(USER_ROLES)),
        async ([email1, email2], password, role) => {
          const user1 = await createTestUser(email1, password, role);
          const user2 = await createTestUser(email2, password, role);
          
          try {
            const auth1 = await authService.authenticate(email1, password, {
              ipAddress: '127.0.0.1',
              userAgent: 'test-agent'
            });
            const auth2 = await authService.authenticate(email2, password, {
              ipAddress: '127.0.0.1',
              userAgent: 'test-agent'
            });
            
            const decoded1 = jwt.verify(auth1.accessToken, config.JWT_SECRET);
            const decoded2 = jwt.verify(auth2.accessToken, config.JWT_SECRET);
            
            expect(decoded1.id).not.toBe(decoded2.id);
            expect(decoded1.jti).not.toBe(decoded2.jti);
            expect(decoded1.email).not.toBe(decoded2.email);
            
            expect(decoded1.role).toBe(decoded2.role);
            expect(decoded1.permissions).toEqual(decoded2.permissions);
            
          } finally {
            await User.findByIdAndDelete(user1._id);
            await User.findByIdAndDelete(user2._id);
          }
        }
      ), { numRuns: 20 });
    });

    test('should validate role-specific permission patterns', () => {
      const rolePermissionTests = [
        {
          role: USER_ROLES.RECEPTIONIST,
          shouldHave: ['appointments:create', 'patients:create', 'queue:generate'],
          shouldNotHave: ['prescriptions:create', 'user_management:create']
        },
        {
          role: USER_ROLES.DOCTOR,
          shouldHave: ['prescriptions:create', 'consultation:create', 'orders:create'],
          shouldNotHave: ['user_management:create', 'hospital_setup:create']
        },
        {
          role: USER_ROLES.ADMIN,
          shouldHave: ['user_management:create', 'hospital_setup:create', 'services_pricing:create'],
          shouldNotHave: ['prescriptions:create', 'consultation:create']
        }
      ];

      return fc.assert(fc.asyncProperty(
        validEmailGen,
        fc.string({ minLength: 6, maxLength: 20 }),
        fc.constantFrom(...rolePermissionTests),
        async (email, password, testCase) => {
          const user = await createTestUser(email, password, testCase.role);
          
          try {
            const authResult = await authService.authenticate(email, password, {
              ipAddress: '127.0.0.1',
              userAgent: 'test-agent'
            });
            
            const decoded = jwt.verify(authResult.accessToken, config.JWT_SECRET);
            
            testCase.shouldHave.forEach(permission => {
              expect(decoded.permissions).toContain(permission);
            });
            
            testCase.shouldNotHave.forEach(permission => {
              expect(decoded.permissions).not.toContain(permission);
            });
            
          } finally {
            await User.findByIdAndDelete(user._id);
          }
        }
      ), { numRuns: 30 });
    });
  });
});