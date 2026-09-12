export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  permissions: Permission[];
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  department?: string;
  specialization?: string;
}

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export enum UserRole {
  RECEPTIONIST = 'receptionist',
  DOCTOR = 'doctor',
  DIAGNOSTIC = 'diagnostic',
  PHARMACY = 'pharmacy',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
  permission?: {
    resource: string;
    action: string;
  };
}

export interface RoleConfig {
  name: string;
  displayName: string;
  description: string;
  color: string;
  dashboardTitle: string;
  navItems: NavItem[];
  restrictions: string[];
}