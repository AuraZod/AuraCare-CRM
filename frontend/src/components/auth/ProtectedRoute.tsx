import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requiredPermission?: {
    resource: string;
    action: string;
  };
}

export function ProtectedRoute({ 
  children, 
  requiredRoles, 
  requiredPermission 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚫</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page. Required roles: {requiredRoles.join(', ')}
            </p>
            <p className="text-sm text-muted-foreground">
              Your role: <span className="font-medium">{user?.role}</span>
            </p>
          </div>
        </div>
      );
    }
  }

  if (requiredPermission) {
    const hasRequiredPermission = hasPermission(
      requiredPermission.resource, 
      requiredPermission.action
    );
    
    if (!hasRequiredPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Permission Required</h2>
            <p className="text-muted-foreground mb-4">
              You don't have the required permission to access this page.
            </p>
            <p className="text-sm text-muted-foreground">
              Required: <span className="font-medium">
                {requiredPermission.resource}:{requiredPermission.action}
              </span>
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}