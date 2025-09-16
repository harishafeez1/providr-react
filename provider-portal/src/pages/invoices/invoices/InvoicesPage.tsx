import { Fragment, useState } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading } from '@/partials/toolbar';
import { Alert } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createCheckoutSession } from '@/services/api/stripe';
import { useAuthContext } from '@/auth';
import { format } from 'date-fns';

const InvoicesPage = () => {
  const { currentUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const subscriptionPlan = currentUser?.subscription_plan;
  const subscriptionDetails = currentUser?.subscription_details;

  const handleSubscriptionCheckout = async () => {
    if (!subscriptionPlan || !currentUser) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const baseUrl = window.location.origin;
      const response = await createCheckoutSession({
        product_id: subscriptionPlan.stripe_product_id,
        price_id: subscriptionPlan.stripe_price_id,
        success_url: `${baseUrl}/provider-portal/invoices`,
        cancel_url: `${baseUrl}/provider-portal/invoices`,
        provider_company_id: Number(currentUser.provider_company_id),
        user_id: currentUser.id
      });

      if (response.url) {
        window.location.href = response.url;
      } else if (response.checkout_url) {
        window.location.href = response.checkout_url;
      } else {
        setSuccess('Checkout session created successfully');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  if (!subscriptionPlan) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <h1 className="text-xl font-medium leading-none text-gray-900">Subscription</h1>
            </ToolbarHeading>
          </Toolbar>

          <Card>
            <CardHeader>
              <CardTitle>No Subscription Plan Available</CardTitle>
              <CardDescription>
                Please contact support to set up a subscription plan.
              </CardDescription>
            </CardHeader>
          </Card>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <h1 className="text-xl font-medium leading-none text-gray-900">Subscription</h1>
          </ToolbarHeading>
        </Toolbar>

        <div className="flex flex-col space-y-6">
          {error && <Alert>{error}</Alert>}
          {success && <Alert>{success}</Alert>}

          <Card>
            <CardHeader>
              <CardTitle>
                {subscriptionDetails?.subscription?.status === 'trialing'
                  ? 'Trial Plan'
                  : subscriptionPlan.name}
              </CardTitle>
              {subscriptionPlan.description && (
                <CardDescription>{subscriptionPlan.description}</CardDescription>
              )}
            </CardHeader>

            <CardContent>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  {subscriptionDetails?.subscription?.status === 'trialing'
                    ? '$0.00'
                    : subscriptionPlan.formatted_amount}
                </span>
                <span className="text-gray-500 ml-2">per {subscriptionPlan.interval_display}</span>
              </div>

              {/* Only show detailed pricing info for non-trial users */}
              {subscriptionDetails?.subscription?.status !== 'trialing' && (
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Currency:</span>
                    <span className="text-gray-900 uppercase">{subscriptionPlan.currency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Billing Interval:</span>
                    <span className="text-gray-900">
                      Every {subscriptionPlan.interval_count} {subscriptionPlan.interval_display}
                    </span>
                  </div>
                </div>
              )}

              {subscriptionDetails?.has_subscription ? (
                <div className="mt-6 space-y-4">
                  {/* Subscription Status */}
                  <div
                    className={`flex items-center p-4 rounded-md ${
                      subscriptionDetails.subscription?.status === 'trialing'
                        ? 'bg-blue-50'
                        : subscriptionDetails.subscription?.status === 'active'
                        ? 'bg-green-50'
                        : 'bg-red-50'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {subscriptionDetails.subscription?.status === 'past_due' ||
                       subscriptionDetails.subscription?.status === 'canceled' ? (
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className={`h-5 w-5 ${
                            subscriptionDetails.subscription?.status === 'trialing'
                              ? 'text-blue-400'
                              : 'text-green-400'
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3
                        className={`text-sm font-medium ${
                          subscriptionDetails.subscription?.status === 'trialing'
                            ? 'text-blue-800'
                            : subscriptionDetails.subscription?.status === 'active'
                            ? 'text-green-800'
                            : 'text-red-800'
                        }`}
                      >
                        {subscriptionDetails.subscription?.status === 'trialing'
                          ? 'Trial Active'
                          : subscriptionDetails.subscription?.status === 'active'
                          ? 'Active Subscription'
                          : subscriptionDetails.subscription?.status === 'past_due'
                          ? 'Payment Past Due'
                          : subscriptionDetails.subscription?.status === 'canceled'
                          ? 'Subscription Cancelled'
                          : 'Subscription Issue'}
                      </h3>
                      <p
                        className={`text-sm mt-1 ${
                          subscriptionDetails.subscription?.status === 'trialing'
                            ? 'text-blue-700'
                            : subscriptionDetails.subscription?.status === 'active'
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}
                      >
                        {subscriptionDetails.subscription?.status === 'trialing'
                          ? `Your trial ends on ${subscriptionDetails.subscription.trial_end ? format(new Date(subscriptionDetails.subscription.trial_end), 'PPP') : 'N/A'}`
                          : subscriptionDetails.subscription?.status === 'active'
                          ? 'You have an active subscription to this plan.'
                          : subscriptionDetails.subscription?.status === 'past_due'
                          ? 'Your payment is past due. Please update your payment method to continue using the service.'
                          : subscriptionDetails.subscription?.status === 'canceled'
                          ? 'Your subscription has been cancelled. You can reactivate it anytime.'
                          : 'There is an issue with your subscription. Please contact support.'}
                      </p>
                    </div>
                  </div>

                  {/* Subscription Details */}
                  {subscriptionDetails.subscription && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Subscription Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="text-gray-900 capitalize">
                            {subscriptionDetails.subscription.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Plan:</span>
                          <span className="text-gray-900">
                            {subscriptionDetails.subscription.status === 'trialing'
                              ? 'Trial Plan'
                              : subscriptionDetails.subscription.plan_name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="text-gray-900">
                            {subscriptionDetails.subscription.status === 'trialing'
                              ? '$0.00'
                              : subscriptionDetails.subscription.plan_amount.replace('AU', '')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {subscriptionDetails.subscription.status === 'trialing'
                              ? 'Trial Period:'
                              : 'Current Period:'}
                          </span>
                          <span className="text-gray-900">
                            {format(
                              new Date(subscriptionDetails.subscription.current_period_start),
                              'MMM dd, yyyy'
                            )}{' '}
                            -{' '}
                            {format(
                              new Date(subscriptionDetails.subscription.current_period_end),
                              'MMM dd, yyyy'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Upgrade Button for Trial Users */}
                    {subscriptionDetails.subscription?.status === 'trialing' && (
                      <div className="space-y-2">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Upgrade for seamless access</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {subscriptionPlan.formatted_amount.replace('AU', '')} per{' '}
                            {subscriptionPlan.interval_display}
                          </p>
                        </div>
                        <Button
                          onClick={handleSubscriptionCheckout}
                          disabled={loading}
                          className="w-full"
                          size="lg"
                        >
                          {loading ? 'Processing...' : 'Upgrade to Full Plan'}
                        </Button>
                      </div>
                    )}

                    {/* Billing Portal Button */}
                    {subscriptionPlan.billing_portal_url && (
                      <Button
                        onClick={() => window.open(subscriptionPlan.billing_portal_url, '_blank')}
                        variant="outline"
                        className="w-full"
                        size="lg"
                      >
                        Manage Billing
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <Button
                    onClick={handleSubscriptionCheckout}
                    disabled={loading || !subscriptionPlan.can_subscribe}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'Processing...' : 'Subscribe Now'}
                  </Button>

                  {!subscriptionPlan.can_subscribe && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      This plan is currently not available for subscription.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </Fragment>
  );
};

export { InvoicesPage };
