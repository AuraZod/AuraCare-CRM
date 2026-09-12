const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const User = require('../../src/models/User');
const { USER_ROLES } = require('../../src/types/rbac');

describe('Authentication Integration Tests', () => {
  
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

  describe('POST /api/auth/login', () => {
    test('should authenticate valid user and return token with permissions', async () => {
      const email = 'integration@example.com';
      const password = 'password123';
      const role = USER_ROLES.DOCTOR;
      
      const user = await createTestUser(email, password, role);
      
      try {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email, password })
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        expect(response.body.expiresIn).toBeDefined();
        
        expect(response.body.user.id).toBe(user._id.toString());
        expect(response.body.user.email).toBe(email.toLowerCase());
        expect(response.body.user.role).toBe(role);
        expect(response.body.user.permissions).toBeDefined();
        expect(Array.isArray(response.body.user.permissions)).toBe(true);
        expect(response.body.user.permissions.length).toBeGreaterThan(0);
        
        const hasPrescritionPermission = response.body.user.permissions.some(p => 
          p.resource === 'prescriptions' && p.action === 'create'
        );
        expect(hasPrescritionPermission).toBe(true);
        
      } finally {
        await User.findByIdAndDelete(user._id);
      }
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ 
          email: 'nonexistent@example.com', 
          password: 'wrongpassword' 
        })
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should reject inactive user', async () => {
      const email = 'inactive@example.com';
      const password = 'password123';
      
      const user = await createTestUser(email, password);
      user.isActive = false;
      await user.save();
      
      try {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email, password })
          .expect(401);
        
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid credentials');
        
      } finally {
        await User.findByIdAndDelete(user._id);
      }
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return current user info when authenticated', async () => {
      const email = 'me@example.com';
      const password = 'password123';
      const role = USER_ROLES.ADMIN;
      
      const user = await createTestUser(email, password, role);
      
      try {
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({ email, password })
          .expect(200);
        
        const token = loginResponse.body.accessToken;
        
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.user.id).toBe(user._id.toString());
        expect(response.body.user.email).toBe(email.toLowerCase());
        expect(response.body.user.role).toBe(role);
        expect(response.body.user.permissions).toBeDefined();
        
        const hasUserMgmtPermission = response.body.user.permissions.some(p => 
          p.resource === 'user_management' && p.action === 'create'
        );
        expect(hasUserMgmtPermission).toBe(true);
        
      } finally {
        await User.findByIdAndDelete(user._id);
      }
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authorized');
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid or expired token');
    });
  });

  describe('Role-specific authentication', () => {
    test('should authenticate users with different roles correctly', async () => {
      const testCases = [
        { role: USER_ROLES.RECEPTIONIST, expectedPermission: 'appointments:create' },
        { role: USER_ROLES.DOCTOR, expectedPermission: 'prescriptions:create' },
        { role: USER_ROLES.DIAGNOSTIC, expectedPermission: 'reports:upload' },
        { role: USER_ROLES.PHARMACY, expectedPermission: 'inventory:read' },
        { role: USER_ROLES.ADMIN, expectedPermission: 'user_management:create' }
      ];

      for (const testCase of testCases) {
        const email = `${testCase.role}@example.com`;
        const password = 'password123';
        
        const user = await createTestUser(email, password, testCase.role);
        
        try {
          const response = await request(app)
            .post('/api/auth/login')
            .send({ email, password })
            .expect(200);
          
          expect(response.body.user.role).toBe(testCase.role);
          
          const hasExpectedPermission = response.body.user.permissions.some(p => 
            `${p.resource}:${p.action}` === testCase.expectedPermission
          );
          expect(hasExpectedPermission).toBe(true);
          
        } finally {
          await User.findByIdAndDelete(user._id);
        }
      }
    });
  });
});