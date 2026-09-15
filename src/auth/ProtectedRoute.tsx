import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../components/common/LoadingState';
import { useAuth } from './useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <LoadingState label="Verifying your session…" />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
