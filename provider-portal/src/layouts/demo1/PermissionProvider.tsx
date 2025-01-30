import { useAuthContext } from '@/auth';
import React from 'react';
import { Navigate } from 'react-router-dom';

interface PermissionWrapperProps {
  children: React.ReactNode;
  requiredPermissions: string[]; // Array of required permissions (e.g., ['editor', 'admin'])
  fallbackPath?: string;
}

const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  requiredPermissions,
  fallbackPath = '/error/404'
}) => {
  const { currentUser } = useAuthContext();

  const hasPermission = (requiredPermissions: string[]): boolean => {
    if (!currentUser) {
      return false;
    }

    return requiredPermissions.some((permission) => {
      switch (permission) {
        case 'billing':
          return currentUser.permission_billing === 1;
        case 'editor':
          return currentUser.permission_editor === 1;
        case 'intake':
          return currentUser.permission_intake === 1;
        case 'review':
          return currentUser.permission_review === 1;
        case 'admin':
          return currentUser.admin === 1;
        default:
          return false;
      }
    });
  };

  if (!hasPermission(requiredPermissions)) {
    if (currentUser?.permission_editor === 1 || currentUser?.admin === 1) {
      return <Navigate to="/" replace />;
    }
    if (currentUser?.permission_intake === 1) {
      return <Navigate to="/service-request" replace />;
    }
    if (currentUser?.permission_review === 1) {
      return <Navigate to="/reviews" replace />;
    }
    if (currentUser?.permission_billing === 1) {
      return <Navigate to="/billing" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PermissionWrapper;
