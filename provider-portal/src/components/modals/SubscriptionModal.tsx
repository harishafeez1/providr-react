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

  // A user is considered cancelled if:
  // 1. They have subscription_exists: false in their plan (indicates they had a subscription before)
  // 2. OR they have has_subscription: false but subscription plan exists (they had access before)
  // 3. OR their subscription status is explicitly "canceled"/"cancelled"
  const hadSubscriptionBefore = subscriptionPlan?.subscription_exists === false;
  const isCancelled = (subscriptionStatus === 'canceled' || subscriptionStatus === 'cancelled') ||
                      (hadSubscriptionBefore && !subscriptionDetails?.has_subscription);

  const hasUsedTrial = subscriptionPlan?.has_used_trial;

  // Debug logging
  console.log('SubscriptionModal Debug:', {
    subscriptionStatus,
    hadSubscriptionBefore,
    isCancelled,
    hasUsedTrial,
    hasSubscription: subscriptionDetails?.has_subscription,
    subscriptionExists: subscriptionPlan?.subscription_exists,
    subscriptionDetails
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
                  {isCancelled ? 'We Miss You! Come Back' : 'Welcome! Choose Your Plan'}
                </h2>
                <p className="text-sm text-gray-600">
                  {(() => {
                    if (isCancelled) {
                      return 'Your subscription is currently inactive. Restart your subscription to regain access to all premium features and continue growing your business with us.';
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
                {subscriptionPlan.can_start_trial && subscriptionPlan.trial_period_days && !isCancelled && !hasUsedTrial && (
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
                  {/* Show Trial Button if user can start trial, is not cancelled, and hasn't used trial */}
                  {subscriptionPlan.can_start_trial && !isCancelled && !hasUsedTrial && (
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

                  {/* Show OR divider when both options are available, not cancelled, and hasn't used trial */}
                  {subscriptionPlan.can_start_trial && subscriptionPlan.can_subscribe && !isCancelled && !hasUsedTrial && (
                    <div className="flex items-center my-4">
                      <hr className="flex-1 border-gray-300" />
                      <span className="px-3 text-sm text-gray-500">or</span>
                      <hr className="flex-1 border-gray-300" />
                    </div>
                  )}

                  {/* Show Subscribe/Reactivate Button */}
                  {subscriptionPlan.can_subscribe && (
                    <Button
                      onClick={handleUpgrade}
                      disabled={isSubscribeLoading}
                      variant={(subscriptionPlan.can_start_trial && !isCancelled && !hasUsedTrial) ? 'outline' : 'default'}
                      className="w-full"
                      size="lg"
                    >
                      {(() => {
                        if (isSubscribeLoading) return 'Processing...';
                        if (isCancelled) return 'Reactivate Subscription';
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
                    {subscriptionPlan.trial_requires_payment_method && !isCancelled && !hasUsedTrial && (
                      <div>credit card required for trial</div>
                    )}
                    {subscriptionPlan.can_start_trial && subscriptionPlan.can_subscribe && !isCancelled && !hasUsedTrial && (
                      <div>Or subscribe immediately for full access</div>
                    )}
                    {isCancelled && (
                      <div>Continue where you left off with full access</div>
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
