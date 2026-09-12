import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings,
  Puzzle,
  Bell,
  UserPlus,
  ClipboardList,
  TestTube,
  Microscope,
  Pill,
  Package,
  Receipt,
  TrendingUp,
  Shield,
  Database,
  Zap,
  Building,
  UserCog,
  DollarSign,
  Activity,
  FileBarChart,
  Lock,
  Cog,
} from 'lucide-react';
import { RoleConfig, UserRole } from '@/types/auth';

export const roleConfigs: Record<UserRole, RoleConfig> = {
  [UserRole.RECEPTIONIST]: {
    name: 'receptionist',
    displayName: 'Receptionist',
    description: 'Front desk operations, speed, accuracy, zero confusion',
    color: 'bg-blue-500',
    dashboardTitle: 'Receptionist Panel',
    navItems: [
      { 
        label: 'Dashboard', 
        icon: LayoutDashboard, 
        href: '/dashboard',
        permission: { resource: 'dashboard', action: 'view' }
      },
      { 
        label: 'Appointments', 
        icon: Calendar, 
        href: '/appointments',
        permission: { resource: 'appointments', action: 'read' }
      },
      { 
        label: 'Patient Registration', 
        icon: UserPlus, 
        href: '/patients/register',
        permission: { resource: 'patients', action: 'create' }
      },
      { 
        label: 'Queue Management', 
        icon: ClipboardList, 
        href: '/queue',
        permission: { resource: 'queue', action: 'generate' }
      },
      { 
        label: 'Billing', 
        icon: CreditCard, 
        href: '/billing',
        permission: { resource: 'billing', action: 'create' }
      },
      { 
        label: 'Reports', 
        icon: FileBarChart, 
        href: '/reports',
        permission: { resource: 'reports', action: 'view' }
      },
    ],
    restrictions: [
      'Cannot edit prescriptions',
      'Cannot edit past bills',
      'Cannot see detailed analytics'
    ]
  },

  [UserRole.DOCTOR]: {
    name: 'doctor',
    displayName: 'Doctor',
    description: 'Fast consultation, zero distractions, clinical focus',
    color: 'bg-green-500',
    dashboardTitle: 'Doctor Panel',
    navItems: [
      { 
        label: 'Dashboard', 
        icon: LayoutDashboard, 
        href: '/dashboard',
        permission: { resource: 'dashboard', action: 'view' }
      },
      { 
        label: 'Patients', 
        icon: Users, 
        href: '/patients',
        permission: { resource: 'patients', action: 'read' }
      },
      { 
        label: 'Consultation', 
        icon: Activity, 
        href: '/consultation',
        permission: { resource: 'consultation', action: 'create' }
      },
      { 
        label: 'Prescriptions', 
        icon: FileText, 
        href: '/prescriptions',
        permission: { resource: 'prescriptions', action: 'create' }
      },
      { 
        label: 'Orders', 
        icon: TestTube, 
        href: '/orders',
        permission: { resource: 'orders', action: 'create' }
      },
      { 
        label: 'Schedule', 
        icon: Calendar, 
        href: '/schedule',
        permission: { resource: 'schedule', action: 'update' }
      },
      { 
        label: 'Analytics', 
        icon: BarChart3, 
        href: '/analytics',
        permission: { resource: 'analytics', action: 'view' }
      },
    ],
    restrictions: [
      'Cannot see hospital financials',
      'Cannot edit other doctors\' data'
    ]
  },

  [UserRole.DIAGNOSTIC]: {
    name: 'diagnostic',
    displayName: 'Diagnostic Staff',
    description: 'Handle test workflow cleanly',
    color: 'bg-purple-500',
    dashboardTitle: 'Diagnostic Panel',
    navItems: [
      { 
        label: 'Dashboard', 
        icon: LayoutDashboard, 
        href: '/dashboard',
        permission: { resource: 'dashboard', action: 'view' }
      },
      { 
        label: 'Test Orders', 
        icon: ClipboardList, 
        href: '/test-orders',
        permission: { resource: 'test_orders', action: 'read' }
      },
      { 
        label: 'Reports', 
        icon: FileText, 
        href: '/reports',
        permission: { resource: 'reports', action: 'upload' }
      },
      { 
        label: 'Equipment Logs', 
        icon: Microscope, 
        href: '/equipment',
        permission: { resource: 'equipment_logs', action: 'view' }
      },
      { 
        label: 'Billing', 
        icon: Receipt, 
        href: '/billing',
        permission: { resource: 'billing', action: 'create' }
      },
    ],
    restrictions: [
      'Cannot edit prescriptions',
      'Cannot see hospital profit analytics'
    ]
  },

  [UserRole.PHARMACY]: {
    name: 'pharmacy',
    displayName: 'Pharmacy Staff',
    description: 'Medicine dispensing + stock control',
    color: 'bg-orange-500',
    dashboardTitle: 'Pharmacy Panel',
    navItems: [
      { 
        label: 'Dashboard', 
        icon: LayoutDashboard, 
        href: '/dashboard',
        permission: { resource: 'dashboard', action: 'view' }
      },
      { 
        label: 'Prescriptions', 
        icon: FileText, 
        href: '/pharmacy/prescriptions',
        permission: { resource: 'prescriptions', action: 'read' }
      },
      { 
        label: 'Billing / POS', 
        icon: CreditCard, 
        href: '/pharmacy/billing',
        permission: { resource: 'billing', action: 'create' }
      },
      { 
        label: 'Inventory', 
        icon: Package, 
        href: '/pharmacy/inventory',
        permission: { resource: 'inventory', action: 'read' }
      },
      { 
        label: 'Customers', 
        icon: Users, 
        href: '/pharmacy/customers',
        permission: { resource: 'patients', action: 'read' }
      },
      { 
        label: 'Purchase', 
        icon: Receipt, 
        href: '/pharmacy/purchase',
        permission: { resource: 'inventory', action: 'create' }
      },
      { 
        label: 'Reports', 
        icon: BarChart3, 
        href: '/pharmacy/reports',
        permission: { resource: 'reports', action: 'view' }
      },
    ],
    restrictions: [
      'Cannot change doctor notes',
      'Cannot edit patient history'
    ]
  },

  [UserRole.ADMIN]: {
    name: 'admin',
    displayName: 'Administrator',
    description: 'System configuration + operational control',
    color: 'bg-red-500',
    dashboardTitle: 'Admin Panel',
    navItems: [
      { 
        label: 'Dashboard', 
        icon: LayoutDashboard, 
        href: '/dashboard',
        permission: { resource: 'dashboard', action: 'view' }
      },
      { 
        label: 'Hospital Setup', 
        icon: Building, 
        href: '/hospital-setup',
        permission: { resource: 'hospital_setup', action: 'create' }
      },
      { 
        label: 'User Management', 
        icon: UserCog, 
        href: '/user-management',
        permission: { resource: 'user_management', action: 'create' }
      },
      { 
        label: 'Services & Pricing', 
        icon: DollarSign, 
        href: '/services-pricing',
        permission: { resource: 'services_pricing', action: 'create' }
      },
      { 
        label: 'Billing & Finance', 
        icon: TrendingUp, 
        href: '/billing-finance',
        permission: { resource: 'billing_finance', action: 'read' }
      },
      { 
        label: 'Integrations', 
        icon: Zap, 
        href: '/integrations',
        permission: { resource: 'integrations', action: 'configure' }
      },
      { 
        label: 'Data Management', 
        icon: Database, 
        href: '/data-management',
        permission: { resource: 'data_management', action: 'export' }
      },
    ],
    restrictions: []
  },

  [UserRole.SUPER_ADMIN]: {
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Business intelligence & control',
    color: 'bg-gray-900',
    dashboardTitle: 'Super Admin Panel',
    navItems: [
      { 
        label: 'Executive Dashboard', 
        icon: LayoutDashboard, 
        href: '/dashboard',
        permission: { resource: 'executive_dashboard', action: 'view' }
      },
      { 
        label: 'Hospital Analytics', 
        icon: BarChart3, 
        href: '/hospital-analytics',
        permission: { resource: 'hospital_analytics', action: 'view' }
      },
      { 
        label: 'Staff Performance', 
        icon: Users, 
        href: '/staff-performance',
        permission: { resource: 'staff_performance', action: 'view' }
      },
      { 
        label: 'Financial Control', 
        icon: Shield, 
        href: '/financial-control',
        permission: { resource: 'financial_control', action: 'view' }
      },
      { 
        label: 'Compliance & Security', 
        icon: Lock, 
        href: '/compliance-security',
        permission: { resource: 'compliance_security', action: 'view' }
      },
      { 
        label: 'Master Settings', 
        icon: Cog, 
        href: '/master-settings',
        permission: { resource: 'master_settings', action: 'configure' }
      },
      { 
        label: 'Hospital Setup', 
        icon: Building, 
        href: '/hospital-setup',
        permission: { resource: 'hospital_setup', action: 'create' }
      },
      { 
        label: 'User Management', 
        icon: UserCog, 
        href: '/user-management',
        permission: { resource: 'user_management', action: 'create' }
      },
    ],
    restrictions: []
  }
};