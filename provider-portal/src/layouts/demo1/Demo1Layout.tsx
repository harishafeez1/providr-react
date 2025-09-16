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
  const hasSubscription = currentUser?.subscription_details?.has_subscription;
  const subscriptionStatus = currentUser?.subscription_details?.subscription?.status;

  // Show modal for:
  // 1. Users who don't have any subscription at all (first-time users)
  // 2. Users with cancelled subscriptions who need to resubscribe
  const showSubscriptionModal = currentUser &&
                                currentUser.subscription_plan &&
                                (!hasSubscription || subscriptionStatus === 'canceled');

  return (
    <Demo1LayoutProvider>
      <Main />
      {showSubscriptionModal && <SubscriptionModal isOpen={true} />}
    </Demo1LayoutProvider>
  );
};

export { Demo1Layout };
