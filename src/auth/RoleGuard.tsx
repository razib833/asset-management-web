import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { RoleCode } from '../types';
import { useAuth } from './useAuth';

export function RoleGuard({ roles, children }: { roles: RoleCode[]; children: ReactNode }) {
  const { isInRole } = useAuth();
  return isInRole(...roles) ? children : <Navigate to="/unauthorized" replace />;
}
