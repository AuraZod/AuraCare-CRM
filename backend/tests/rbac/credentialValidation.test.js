const fc = require('fast-check');
const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');
const authService = require('../../src/services/authService');
const { USER_ROLES } = require('../../src/types/rbac');

describe('RBAC Credential Validation Tests', () => {

  describe('Property 1: Credential Validation Consistency', () => {
    
    const createTestUser = async (email, password, role = USER_ROLES.DOCTOR) => {
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

    test('should consistently accept valid credentials', async () => {
      await fc.assert(fc.asyncProperty(
        validEmailGen,
        fc.string({ minLength: 6, maxLength: 20 }),
        fc.constantFrom(...Object.values(USER_ROLES)),
        async (email, password, role) => {
          const user = await createTestUser(email, password, role);
          
          try {
            const result = await authService.validateCredentials(email, password);
            
            expect(result).not.toBeNull();
            expect(result.email).toBe(email.toLowerCase());
            expect(result.role).toBe(role);
            expect(result.isActive).toBe(true);
            
            expect(result.lastLogin).toBeDefined();
          } finally {
            await User.findByIdAndDelete(user._id);
          }
        }
      ), { numRuns: 30 });
    });

    test('should consistently reject invalid passwords', async () => {
      await fc.assert(fc.asyncProperty(
        validEmailGen,
        fc.string({ minLength: 6, maxLength: 20 }),
        fc.string({ minLength: 6, maxLength: 20 }),
        async (email, correctPassword, wrongPassword) => {
          if (correctPassword === wrongPassword) return;
          
          const user = await createTestUser(email, correctPassword);
          
          try {
            const result = await authService.validateCredentials(email, wrongPassword);
            
            expect(result).toBeNull();
          } finally {
            await User.findByIdAndDelete(user._id);
          }
        }
      ), { numRuns: 30 });
    });

    test('should consistently reject non-existent users', async () => {
      await fc.assert(fc.asyncProperty(
        validEmailGen,
        fc.string({ minLength: 6, maxLength: 20 }),
        async (email, password) => {
          await User.deleteMany({ email: email.toLowerCase() });
          
          const result = await authService.validateCredentials(email, password);
          
          expect(result).toBeNull();
        }
      ), { numRuns: 30 });
    });

    test('should reject inactive users', async () => {
      await fc.assert(fc.asyncProperty(
        validEmailGen,
        fc.string({ minLength: 6, maxLength: 20 }),
        async (email, password) => {
          const user = await createTestUser(email, password);
          user.isActive = false;
          await user.save();
          
          try {
            const result = await authService.validateCredentials(email, password);
            
            expect(result).toBeNull();
          } finally {
            await User.findByIdAndDelete(user._id);
          }
        }
      ), { numRuns: 20 });
    });

    test('should handle case-insensitive email validation', async () => {
      await fc.assert(fc.asyncProperty(
        validEmailGen,
        fc.string({ minLength: 6, maxLength: 20 }),
        async (email, password) => {
          const user = await createTestUser(email.toLowerCase(), password);
          
          try {
            const upperResult = await authService.validateCredentials(email.toUpperCase(), password);
            const mixedResult = await authService.validateCredentials(
              email.charAt(0).toUpperCase() + email.slice(1).toLowerCase(), 
              password
            );
            
            if (upperResult) {
              expect(upperResult.email).toBe(email.toLowerCase());
            }
            if (mixedResult) {
              expect(mixedResult.email).toBe(email.toLowerCase());
            }
          } finally {
            await User.findByIdAndDelete(user._id);
          }
        }
      ), { numRuns: 20 });
    });

    test('should require both email and password', async () => {
      await expect(authService.validateCredentials('', 'password123'))
        .rejects.toThrow('Email and password are required');
      
      await expect(authService.validateCredentials(null, 'password123'))
        .rejects.toThrow('Email and password are required');
      
      await expect(authService.validateCredentials('test@example.com', ''))
        .rejects.toThrow('Email and password are required');
      
      await expect(authService.validateCredentials('test@example.com', null))
        .rejects.toThrow('Email and password are required');
    });
  });
});