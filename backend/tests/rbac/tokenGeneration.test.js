const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');
const authService = require('../../src/services/authService');
const { USER_ROLES } = require('../../src/types/rbac');
const config = require('../../src/config');

describe('JWT Token Generation Tests', () => {
  
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

  test('should generate valid JWT tokens with correct payload', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const role = USER_ROLES.DOCTOR;
    
    const user = await createTestUser(email, password, role);
    
    try {
      const tokens = await authService.generateTokens(user);
      
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens).toHaveProperty('jti');
      expect(tokens).toHaveProperty('expiresIn');
      
      const decoded = jwt.verify(tokens.accessToken, config.JWT_SECRET);
      expect(decoded.id).toBe(user._id.toString());
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(role);
      expect(decoded.permissions).toBeDefined();
      expect(decoded.jti).toBe(tokens.jti);
      expect(decoded.iss).toBe('hospital-crm');
      expect(decoded.aud).toBe('hospital-staff');
      
      const refreshDecoded = jwt.verify(tokens.refreshToken, config.JWT_REFRESH_SECRET || config.JWT_SECRET);
      expect(refreshDecoded.id).toBe(user._id.toString());
      expect(refreshDecoded.jti).toBe(tokens.jti);
      
    } finally {
      await User.findByIdAndDelete(user._id);
    }
  });

  test('should include role-specific permissions in token', async () => {
    const testCases = [
      { role: USER_ROLES.RECEPTIONIST, expectedPermissions: ['dashboard:view', 'appointments:create'] },
      { role: USER_ROLES.DOCTOR, expectedPermissions: ['dashboard:view', 'prescriptions:create'] },
      { role: USER_ROLES.ADMIN, expectedPermissions: ['hospital_setup:create', 'user_management:create'] }
    ];

    for (const testCase of testCases) {
      const user = await createTestUser(`test-${testCase.role}@example.com`, 'password123', testCase.role);
      
      try {
        const tokens = await authService.generateTokens(user);
        const decoded = jwt.verify(tokens.accessToken, config.JWT_SECRET);
        
        testCase.expectedPermissions.forEach(permission => {
          expect(decoded.permissions).toContain(permission);
        });
        
      } finally {
        await User.findByIdAndDelete(user._id);
      }
    }
  });

  test('should generate unique JTI for each token', async () => {
    const user1 = await createTestUser('user1@example.com', 'password123');
    const user2 = await createTestUser('user2@example.com', 'password123');
    
    try {
      const tokens1 = await authService.generateTokens(user1);
      const tokens2 = await authService.generateTokens(user2);
      
      expect(tokens1.jti).not.toBe(tokens2.jti);
      
      const tokens3 = await authService.generateTokens(user1);
      expect(tokens1.jti).not.toBe(tokens3.jti);
      
    } finally {
      await User.findByIdAndDelete(user1._id);
      await User.findByIdAndDelete(user2._id);
    }
  });

  test('should set appropriate token expiration', async () => {
    const user = await createTestUser('expiry@example.com', 'password123');
    
    try {
      const tokens = await authService.generateTokens(user);
      
      expect(tokens.expiresIn).toBe(15 * 60 * 1000);
      
      const decoded = jwt.verify(tokens.accessToken, config.JWT_SECRET);
      const expectedExpiry = Math.floor((Date.now() + tokens.expiresIn) / 1000);
      
      expect(Math.abs(decoded.exp - expectedExpiry)).toBeLessThan(5);
      
    } finally {
      await User.findByIdAndDelete(user._id);
    }
  });

  test('should get user permissions correctly for all roles', () => {
    Object.values(USER_ROLES).forEach(role => {
      const permissions = authService.getUserPermissions(role);
      expect(permissions).toBeDefined();
      expect(Array.isArray(permissions)).toBe(true);
      
      if (role !== USER_ROLES.SUPER_ADMIN) {
        expect(permissions.length).toBeGreaterThan(0);
      }
    });
    
    const invalidPermissions = authService.getUserPermissions('invalid_role');
    expect(invalidPermissions).toEqual([]);
  });
});