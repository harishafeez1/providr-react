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
