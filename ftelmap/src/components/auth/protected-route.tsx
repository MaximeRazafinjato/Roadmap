import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { Box, LinearProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  requiredRoles?: string[];
  requiredRole?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/login',
  requiredRoles = [],
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Combine requiredRole and requiredRoles
  const allRequiredRoles = requiredRole ? [...requiredRoles, requiredRole] : requiredRoles;

  if (isLoading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
        }}
      >
        <LinearProgress
          sx={{
            height: 3,
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
          }}
        />
      </Box>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is required but user doesn't have required roles
  if (requireAuth && isAuthenticated && allRequiredRoles.length > 0) {
    const hasRequiredRole = allRequiredRoles.some((role) => user?.roles?.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If user is authenticated but shouldn't access this route (e.g., login page)
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/timeline" replace />;
  }

  return <>{children}</>;
}

// Convenience component for public routes (accessible only when not authenticated)
export function PublicRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;
}

// Convenience component for admin routes
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRoles={['Admin']}>{children}</ProtectedRoute>;
}
