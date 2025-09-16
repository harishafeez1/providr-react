import { Fragment, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal, ModalContent, ModalBackdrop } from '@/components/modal';
import { useAuthContext } from '@/auth';
import { createCheckoutSession, createTrialSession } from '@/services/api/stripe';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose?: () => void; // Optional since modal is non-dismissible
}

const SubscriptionModal = ({ isOpen }: SubscriptionModalProps) => {
  const { currentUser } = useAuthContext();
  const [isTrialLoading, setIsTrialLoading] = useState(false);
  const [isSubscribeLoading, setIsSubscribeLoading] = useState(false);

  const subscriptionPlan = currentUser?.subscription_plan;
  const subscriptionDetails = currentUser?.subscription_details;
  const subscriptionStatus = subscriptionDetails?.subscription?.status;

  // Define subscription statuses that need reactivation
  const problematicStatuses = [
    'incomplete',
    'incomplete_expired',
    'past_due',
    'canceled',
    'cancelled',
    'unpaid',
    'paused'
  ];

  // Check if subscription needs attention
  const hasProblematicStatus = subscriptionStatus && problematicStatuses.includes(subscriptionStatus);

  // Only show reactivation for users who actually had a subscription before
  // subscription_exists: true means they currently have or had a subscription
  // subscription_exists: false + has_subscription: false = first time user
  const hadSubscriptionBefore = subscriptionPlan?.subscription_exists === true && !subscriptionDetails?.has_subscription;
  const needsReactivation = hasProblematicStatus || hadSubscriptionBefore;

  // For messaging, distinguish between different types of issues
  const isCancelled = subscriptionStatus === 'canceled' || subscriptionStatus === 'cancelled';
  const isPastDue = subscriptionStatus === 'past_due';
  const isUnpaid = subscriptionStatus === 'unpaid';
  const isPaused = subscriptionStatus === 'paused';
  const isIncomplete = subscriptionStatus === 'incomplete' || subscriptionStatus === 'incomplete_expired';

  // Define which statuses need billing portal vs new subscription
  // Use billing portal for any existing subscription (except active/trialing which shouldn't show modal)
  const hasExistingSubscription = subscriptionDetails?.has_subscription && subscriptionDetails?.subscription;
  const needsBillingPortal = hasExistingSubscription && subscriptionPlan.billing_portal_url;

  // Only create new subscriptions for users who never had one or whose subscription completely ended
  const needsNewSubscription = !hasExistingSubscription;

  const hasUsedTrial = subscriptionPlan?.has_used_trial;

  // Debug logging
  console.log('SubscriptionModal Debug:', {
    subscriptionStatus,
    needsReactivation,
    needsBillingPortal,
    needsNewSubscription,
    isCancelled,
    isPastDue,
    isUnpaid,
    isPaused,
    isIncomplete,
    hasUsedTrial,
    hasSubscription: subscriptionDetails?.has_subscription,
    subscriptionExists: subscriptionPlan?.subscription_exists,
    billingPortalUrl: subscriptionPlan?.billing_portal_url
  });

  if (!subscriptionPlan) {
    return null;
  }

  const handleStartTrial = async () => {
    setIsTrialLoading(true);
    try {
      const trialData = await createTrialSession({
        product_id: subscriptionPlan.stripe_product_id,
        price_id: subscriptionPlan.stripe_price_id,
        success_url: `${window.location.origin}/`,
        cancel_url: `${window.location.origin}/`,
        provider_company_id: currentUser?.provider_company_id as number,
        user_id: currentUser?.id as number
      });

      if (trialData?.url) {
        window.location.href = trialData.url;
      } else {
        throw new Error('No trial URL received');
      }
    } catch (error) {
      console.error('Failed to start trial:', error);
      setIsTrialLoading(false);
    }
  };

  const handleBillingPortal = () => {
    // For past_due subscriptions, always use the billing portal
    if (subscriptionPlan.billing_portal_url) {
      window.open(subscriptionPlan.billing_portal_url, '_blank');
    } else {
      console.error('No billing portal URL available');
      // Could show an error message to user here
    }
  };

  const handleUpgrade = async () => {
    setIsSubscribeLoading(true);
    try {
      const checkoutData = await createCheckoutSession({
        product_id: subscriptionPlan.stripe_product_id,
        price_id: subscriptionPlan.stripe_price_id,
        success_url: `${window.location.origin}/`,
        cancel_url: `${window.location.origin}/`,
        provider_company_id: currentUser?.provider_company_id as number,
        user_id: currentUser?.id as number
      });

      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Failed to start subscription:', error);
      setIsSubscribeLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={() => {}} disableEscapeKeyDown>
      <Fragment>
        <ModalContent className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl">
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {(() => {
                    if (isCancelled) return 'We Miss You! Come Back';
                    if (isPastDue) return 'Payment Required';
                    if (isUnpaid) return 'Payment Failed';
                    if (isPaused) return 'Subscription Paused';
                    if (isIncomplete) return 'Complete Your Subscription';
                    if (needsReactivation) return 'Reactivate Your Subscription';
                    return 'Welcome! Choose Your Plan';
                  })()}
                </h2>
                <p className="text-sm text-gray-600">
                  {(() => {
                    if (isCancelled) {
                      return 'Your subscription is currently inactive. Restart your subscription to regain access to all premium features and continue growing your business with us.';
                    }
                    if (isPastDue) {
                      return 'Your payment is past due. Update your payment method to continue using all features without interruption.';
                    }
                    if (isUnpaid) {
                      return 'Your payment failed and your subscription is currently unpaid. Please update your payment information to restore access.';
                    }
                    if (isPaused) {
                      return 'Your subscription is currently paused. Resume your subscription to regain access to all features.';
                    }
                    if (isIncomplete) {
                      return 'Your subscription setup was not completed. Finish the setup process to start using all premium features.';
                    }
                    if (needsReactivation) {
                      return 'Your subscription needs attention. Reactivate to continue using all premium features.';
                    }
                    if (subscriptionPlan.can_start_trial && !hasUsedTrial && subscriptionPlan.can_subscribe) {
                      return 'Start with a free trial or subscribe immediately for full access';
                    }
                    if (subscriptionPlan.can_start_trial && !hasUsedTrial) {
                      return 'Get started with a free trial';
                    }
                    return 'Get started with the perfect plan for your business needs';
                  })()}
                </p>
              </div>

              {/* Plan Card */}
              <Card className="relative">
                {subscriptionPlan.can_start_trial && subscriptionPlan.trial_period_days && !needsReactivation && !hasUsedTrial && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      {subscriptionPlan.trial_period_days} Day Free Trial
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-xl font-bold">{subscriptionPlan.name}</CardTitle>
                  {subscriptionPlan.description && (
                    <CardDescription className="text-sm mt-2">
                      {subscriptionPlan.description}
                    </CardDescription>
                  )}

                  <div className="mt-4">
                    <div className="text-3xl font-bold text-gray-900">
                      {subscriptionPlan.formatted_amount}
                    </div>
                    <div className="text-gray-600 text-sm">
                      per {subscriptionPlan.interval_display}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Show Trial Button if user can start trial, doesn't need reactivation, and hasn't used trial */}
                  {subscriptionPlan.can_start_trial && !needsReactivation && !hasUsedTrial && (
                    <Button
                      onClick={handleStartTrial}
                      disabled={isTrialLoading}
                      className="w-full"
                      size="lg"
                    >
                      {isTrialLoading
                        ? 'Starting Trial...'
                        : `Start ${subscriptionPlan.trial_period_days} Day Free Trial`}
                    </Button>
                  )}

                  {/* Show OR divider when both options are available, doesn't need reactivation, and hasn't used trial */}
                  {subscriptionPlan.can_start_trial && subscriptionPlan.can_subscribe && !needsReactivation && !hasUsedTrial && (
                    <div className="flex items-center my-4">
                      <hr className="flex-1 border-gray-300" />
                      <span className="px-3 text-sm text-gray-500">or</span>
                      <hr className="flex-1 border-gray-300" />
                    </div>
                  )}

                  {/* Show Subscribe/Reactivate/Manage Button */}
                  {(subscriptionPlan.can_subscribe || needsBillingPortal) && (
                    <Button
                      onClick={needsBillingPortal ? handleBillingPortal : handleUpgrade}
                      disabled={needsBillingPortal ? false : isSubscribeLoading}
                      variant={(subscriptionPlan.can_start_trial && !needsReactivation && !hasUsedTrial) ? 'outline' : 'default'}
                      className="w-full"
                      size="lg"
                    >
                      {(() => {
                        if (isSubscribeLoading) return 'Processing...';
                        if (needsBillingPortal) return 'Manage Subscription';
                        if (needsReactivation) return 'Reactivate Subscription';
                        return `Subscribe to ${subscriptionPlan.name}`;
                      })()}
                    </Button>
                  )}

                  {/* Features */}
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">What's included:</h4>
                    <ul className="space-y-2 text-xs text-gray-600">
                      <li className="flex items-center">
                        <svg
                          className="w-3 h-3 text-green-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Full access to provider portal
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="w-3 h-3 text-green-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Service offerings management
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="w-3 h-3 text-green-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Analytics and reporting
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="w-3 h-3 text-green-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Customer support
                      </li>
                    </ul>
                  </div>

                  {/* Additional info based on available options */}
                  <div className="text-xs text-gray-500 text-center mt-4 space-y-1">
                    {subscriptionPlan.trial_requires_payment_method && !needsReactivation && !hasUsedTrial && (
                      <div>credit card required for trial</div>
                    )}
                    {subscriptionPlan.can_start_trial && subscriptionPlan.can_subscribe && !needsReactivation && !hasUsedTrial && (
                      <div>Or subscribe immediately for full access</div>
                    )}
                    {needsReactivation && (
                      <div>
                        {needsBillingPortal
                          ? 'Access Stripe billing portal to manage your subscription'
                          : 'Restore full access to all premium features'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ModalContent>
      </Fragment>
    </Modal>
  );
};

export { SubscriptionModal };
