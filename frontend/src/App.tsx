import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/auth";

import Login from "./pages/Login";
import RoleDashboard from "./pages/RoleDashboard";
import Appointments from "./pages/Appointments";
import Patients from "./pages/Patients";
import Modules from "./pages/Modules";
import { Prescriptions } from "./pages/Prescriptions";
import { Consultation } from "./pages/Consultation";
import { Orders } from "./pages/Orders";
import { Schedule } from "./pages/Schedule";
import { Queue } from "./pages/Queue";
import { Reports } from "./pages/Reports";
import { PatientRegistration } from "./pages/PatientRegistration";
import Billing from "./pages/Billing";
import Equipment from "./pages/Equipment";
import { TestOrders } from "./pages/TestOrders";
import Followups from "./pages/Followups";
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import HospitalSetup from "./pages/HospitalSetup";
import UserManagement from "./pages/UserManagement";
import ServicesPricing from "./pages/ServicesPricing";
import BillingFinance from "./pages/BillingFinance";
import Integrations from "./pages/Integrations";
import DataManagement from "./pages/DataManagement";
import HospitalAnalytics from "./pages/hospital-analytics";
import StaffPerformance from "./pages/staff-performance";
import FinancialControl from "./pages/financial-control";
import ComplianceSecurity from "./pages/compliance-security";
import MasterSettings from "./pages/master-settings";
import PharmacyInventory from "./pages/pharmacy/PharmacyInventory";
import PharmacyBilling from "./pages/pharmacy/PharmacyBilling";
import PharmacyCustomers from "./pages/pharmacy/PharmacyCustomers";
import PharmacyPrescriptions from "./pages/pharmacy/PharmacyPrescriptions";
import PharmacyPurchase from "./pages/pharmacy/PharmacyPurchase";
import PharmacyReports from "./pages/pharmacy/PharmacyReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
        <AuthProvider>
          <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <RoleDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/appointments" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'appointments', action: 'read' }}>
                  <Appointments />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/patients" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'patients', action: 'read' }}>
                  <Patients />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/patients/:id" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'patients', action: 'read' }}>
                  <Patients />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/patients/register" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'patients', action: 'create' }}>
                  <PatientRegistration />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/queue" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.RECEPTIONIST, UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <Queue />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'reports', action: 'view' }}>
                  <Reports />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/consultation" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.DOCTOR]}>
                  <Consultation />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/prescriptions" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'prescriptions', action: 'read' }}>
                  <Prescriptions />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/prescriptions/new" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'prescriptions', action: 'create' }}>
                  <Prescriptions />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.DOCTOR]}>
                  <Orders />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/orders/new" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.DOCTOR]}>
                  <Orders />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/schedule" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.DOCTOR]}>
                  <Schedule />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/billing" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'billing', action: 'create' }}>
                  <Billing />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/test-orders" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'test_orders', action: 'read' }}>
                  <TestOrders />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/equipment" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'equipment_logs', action: 'view' }}>
                  <Equipment />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/followups" 
              element={
                <ProtectedRoute>
                  <Followups />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'analytics', action: 'view' }}>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/modules" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <Modules />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/hospital-setup" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <HospitalSetup />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/user-management" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
 
            <Route 
              path="/hospital-analytics" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN]}>
                  <HospitalAnalytics />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/staff-performance" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN]}>
                  <StaffPerformance />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/financial-control" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN]}>
                  <FinancialControl />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/compliance-security" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN]}>
                  <ComplianceSecurity />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/master-settings" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN]}>
                  <MasterSettings />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/services-pricing" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <ServicesPricing />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/billing-finance" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <BillingFinance />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/integrations" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <Integrations />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/data-management" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <DataManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/pharmacy/prescriptions" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.PHARMACY, UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <PharmacyPrescriptions />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/pharmacy/billing" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.PHARMACY, UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <PharmacyBilling />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/pharmacy/inventory" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.PHARMACY, UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <PharmacyInventory />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/pharmacy/customers" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.PHARMACY, UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <PharmacyCustomers />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/pharmacy/purchase" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.PHARMACY, UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <PharmacyPurchase />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/pharmacy/reports" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.PHARMACY, UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                  <PharmacyReports />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
