import { Fragment, useState } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/auth';
import { Navigate } from 'react-router-dom';
import { createCheckoutSession, createTrialSession } from '@/services/api/stripe';

const SubscriptionPlansPage = () => {
  const { currentUser } = useAuthContext();
  const [isTrialLoading, setIsTrialLoading] = useState(false);
  const [isSubscribeLoading, setIsSubscribeLoading] = useState(false);

  // If user already has a subscription, redirect to main app
  if (currentUser?.subscription_details?.has_subscription) {
    return <Navigate to="/" replace />;
  }

  const subscriptionPlan = currentUser?.subscription_plan;

  if (!subscriptionPlan) {
    return <Navigate to="/" replace />;
  }

  const handleStartTrial = async () => {
    setIsTrialLoading(true);
    try {
      // Create a trial session
      const trialData = await createTrialSession({
        product_id: subscriptionPlan.stripe_product_id,
        price_id: subscriptionPlan.stripe_price_id,
        success_url: `${window.location.origin}/`,
        cancel_url: `${window.location.origin}/onboarding/subscription`,
        provider_company_id: currentUser?.provider_company_id as number,
        user_id: currentUser?.id as number
      });

      // Redirect to Stripe checkout
      if (trialData?.url) {
        window.location.href = trialData.url;
      } else {
        throw new Error('No trial URL received');
      }
    } catch (error) {
      console.error('Failed to start trial:', error);
      setIsTrialLoading(false);
      // You might want to show an error message to the user here
    }
  };

  const handleUpgrade = async () => {
    setIsSubscribeLoading(true);
    try {
      // Create a checkout session for direct subscription
      const checkoutData = await createCheckoutSession({
        product_id: subscriptionPlan.stripe_product_id,
        price_id: subscriptionPlan.stripe_price_id,
        success_url: `${window.location.origin}/`,
        cancel_url: `${window.location.origin}/onboarding/subscription`,
        provider_company_id: currentUser?.provider_company_id as number,
        user_id: currentUser?.id as number
      });

      // Redirect to Stripe checkout
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
    <Fragment>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mx-auto">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome! Choose Your Plan</h1>
              <p className="text-lg text-gray-600">
                {subscriptionPlan.can_start_trial && subscriptionPlan.can_subscribe
                  ? 'Start with a free trial or subscribe immediately for full access'
                  : subscriptionPlan.can_start_trial
                    ? 'Get started with a free trial'
                    : 'Get started with the perfect plan for your business needs'}
              </p>
            </div>

            {/* Plan Card */}
            <div className="max-w-md mx-auto">
              <Card className="relative">
                {subscriptionPlan.can_start_trial && subscriptionPlan.trial_period_days && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      {subscriptionPlan.trial_period_days} Day Free Trial
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl font-bold">{subscriptionPlan.name}</CardTitle>
                  {subscriptionPlan.description && (
                    <CardDescription className="text-base mt-2">
                      {subscriptionPlan.description}
                    </CardDescription>
                  )}

                  <div className="mt-6">
                    <div className="text-4xl font-bold text-gray-900">
                      {subscriptionPlan.formatted_amount}
                    </div>
                    <div className="text-gray-600 text-sm">
                      per {subscriptionPlan.interval_display}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Show Trial Button if user can start trial */}
                  {subscriptionPlan.can_start_trial && (
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

                  {/* Show OR divider when both options are available */}
                  {subscriptionPlan.can_start_trial && subscriptionPlan.can_subscribe && (
                    <div className="flex items-center my-4">
                      <hr className="flex-1 border-gray-300" />
                      <span className="px-3 text-sm text-gray-500">or</span>
                      <hr className="flex-1 border-gray-300" />
                    </div>
                  )}

                  {/* Show Subscribe Button */}
                  {subscriptionPlan.can_subscribe && (
                    <Button
                      onClick={handleUpgrade}
                      disabled={isSubscribeLoading}
                      variant={subscriptionPlan.can_start_trial ? 'outline' : 'default'}
                      className="w-full"
                      size="lg"
                    >
                      {isSubscribeLoading ? 'Processing...' : `Subscribe to ${subscriptionPlan.name}`}
                    </Button>
                  )}

                  {/* Features */}
                  <div className="mt-8 pt-6 border-t">
                    <h4 className="font-semibold text-gray-900 mb-4">What's included:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <svg
                          className="w-4 h-4 text-green-500 mr-2"
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
                          className="w-4 h-4 text-green-500 mr-2"
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
                          className="w-4 h-4 text-green-500 mr-2"
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
                          className="w-4 h-4 text-green-500 mr-2"
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
                    {subscriptionPlan.can_start_trial && (
                      <div>No credit card required for trial</div>
                    )}
                    {subscriptionPlan.can_start_trial && subscriptionPlan.can_subscribe && (
                      <div>Or subscribe immediately for full access</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </div>
    </Fragment>
  );
};

export { SubscriptionPlansPage };
