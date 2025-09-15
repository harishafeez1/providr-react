import { useAuthContext } from '@/auth';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ScreenLoader } from '@/components/loaders';
import { SubscriptionModal } from '@/components/modals';

const RequireSubscription = () => {
  const { currentUser, loading } = useAuthContext();
  const location = useLocation();

  // Show loading while authentication is being verified
  if (loading) {
    return <ScreenLoader />;
  }

  // If user is not authenticated, let RequireAuth handle it
  if (!currentUser) {
    return <Outlet />;
  }

  // Check if user needs to see subscription plans (first time users)
  // User needs onboarding if they have no subscription and no existing subscription record
  const needsSubscriptionOnboarding = !currentUser.subscription_details?.has_subscription &&
                                     currentUser.subscription_plan &&
                                     !currentUser.subscription_plan.subscription_exists;

  if (needsSubscriptionOnboarding) {
    return (
      <>
        <Outlet />
        <SubscriptionModal isOpen={true} />
      </>
    );
  }

  // Check if trial has ended and user has no active subscription
  const trialEnded = currentUser.subscription_details &&
                    !currentUser.subscription_details.has_subscription &&
                    currentUser.subscription_plan?.subscription_exists;

  // Don't redirect to invoices if we're already on the invoices page
  if (trialEnded && !location.pathname.includes('/invoices')) {
    return <Navigate to="/invoices" replace />;
  }

  return <Outlet />;
};

export { RequireSubscription };