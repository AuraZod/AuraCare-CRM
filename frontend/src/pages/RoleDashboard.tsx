import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { ReceptionistDashboard } from '@/components/dashboards/ReceptionistDashboard';
import { DoctorDashboard } from '@/components/dashboards/DoctorDashboard';
import { DiagnosticDashboard } from '@/components/dashboards/DiagnosticDashboard';
import { PharmacyDashboard } from '@/components/dashboards/PharmacyDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { SuperAdminDashboard } from '@/components/dashboards/SuperAdminDashboard';
import Dashboard from './Dashboard';

export default function RoleDashboard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  switch (user.role) {
    case UserRole.RECEPTIONIST:
      return <ReceptionistDashboard />;
    
    case UserRole.DOCTOR:
      return <DoctorDashboard />;
    
    case UserRole.DIAGNOSTIC:
      return <DiagnosticDashboard />;
    
    case UserRole.PHARMACY:
      return <PharmacyDashboard />;
    
    case UserRole.ADMIN:
      return <AdminDashboard />;
    
    case UserRole.SUPER_ADMIN:
      return <SuperAdminDashboard />;
    
    default:
      return <Dashboard />;
  }
}