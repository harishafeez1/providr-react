import { useAuthContext } from '@/auth';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { SubscriptionRestrictedView } from '@/components/subscription/SubscriptionRestrictedView';

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

  // Check if subscription is cancelled
  const subscriptionDetails = currentUser?.subscription_details;
  const subscriptionPlan = currentUser?.subscription_plan;
  const subscriptionStatus = subscriptionDetails?.subscription?.status;

  // Define subscription statuses that should restrict access
  const problematicStatuses = [
    'incomplete',
    'incomplete_expired',
    'past_due',
    'canceled',
    'cancelled', // Handle both spellings
    'unpaid',
    'paused'
  ];

  // Check if subscription is in a problematic state
  const hasProblematicStatus = subscriptionStatus && problematicStatuses.includes(subscriptionStatus);
  const hadSubscriptionBefore = subscriptionPlan?.subscription_exists === false;
  const isSubscriptionProblematic = hasProblematicStatus ||
                                   (hadSubscriptionBefore && !subscriptionDetails?.has_subscription);

  // If subscription has issues, always show the restricted view with subscription modal
  if (isSubscriptionProblematic) {
    return <SubscriptionRestrictedView />;
  }

  // Handle both MySQL (0/1) and PostgreSQL (true/false) boolean formats
  const hasPermission = (requiredPermissions: string[]): boolean => {
    if (!currentUser) {
      return false;
    }

    return requiredPermissions.some((permission) => {
      switch (permission) {
        case 'billing':
          return Boolean(currentUser.permission_billing);
        case 'editor':
          return Boolean(currentUser.permission_editor);
        case 'intake':
          return Boolean(currentUser.permission_intake);
        case 'review':
          return Boolean(currentUser.permission_review);
        case 'admin':
          return Boolean(currentUser.admin);
        default:
          return false;
      }
    });
  };

  if (!hasPermission(requiredPermissions)) {
    if (Boolean(currentUser?.permission_editor) || Boolean(currentUser?.admin)) {
      return <Navigate to="/" replace />;
    }
    if (Boolean(currentUser?.permission_intake)) {
      return <Navigate to="/service-request" replace />;
    }
    if (Boolean(currentUser?.permission_review)) {
      return <Navigate to="/reviews" replace />;
    }
    if (Boolean(currentUser?.permission_billing)) {
      return <Navigate to="/billing" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PermissionWrapper;
