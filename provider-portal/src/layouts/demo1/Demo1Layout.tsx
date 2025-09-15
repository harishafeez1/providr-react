import useBodyClasses from '@/hooks/useBodyClasses';
import { Demo1LayoutProvider, Main } from './';
import { useAuthContext } from '@/auth';
import { SubscriptionModal } from '@/components/modals';
import { useLocation } from 'react-router-dom';

const Demo1Layout = () => {
  const { currentUser } = useAuthContext();
  const location = useLocation();

  // Using the useBodyClasses hook to set background styles for light and dark modes
  useBodyClasses(`
    [--tw-page-bg:#fefefe]
    [--tw-page-bg-dark:var(--tw-coal-500)]
    demo1
    sidebar-fixed
    header-fixed
    bg-[--tw-page-bg]
    dark:bg-[--tw-page-bg-dark]
  `);

  // Check subscription status
  const subscriptionStatus = currentUser?.subscription_details?.subscription?.status;
  const hasSubscription = currentUser?.subscription_details?.has_subscription;

  // Check if user needs to see subscription plans (first time users)
  const needsSubscriptionOnboarding = currentUser &&
                                     !hasSubscription &&
                                     currentUser.subscription_plan &&
                                     !currentUser.subscription_plan.subscription_exists;

  // Check if subscription is in a problematic state (past_due, canceled, etc.)
  const subscriptionProblematic = hasSubscription &&
                                 subscriptionStatus &&
                                 !['active', 'trialing'].includes(subscriptionStatus);

  // Don't show modal for users with active subscriptions or active trials
  // Show modal for: first-time users, past_due, cancelled users
  const showSubscriptionModal = needsSubscriptionOnboarding ||
                                (subscriptionProblematic && !location.pathname.includes('/invoices'));

  return (
    <Demo1LayoutProvider>
      <Main />
      {showSubscriptionModal && <SubscriptionModal isOpen={true} />}
    </Demo1LayoutProvider>
  );
};

export { Demo1Layout };
