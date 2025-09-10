import { Fragment, useState } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading } from '@/partials/toolbar';
import { Alert } from '@/components';
import { createCheckoutSession } from '@/services/api/stripe';
import { useAuthContext } from '@/auth';

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

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              No Subscription Plan Available
            </h2>
            <p className="text-gray-600">Please contact support to set up a subscription plan.</p>
          </div>
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

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">{subscriptionPlan.name}</h2>
              {subscriptionPlan.description && (
                <p className="text-sm text-gray-600 mt-1">{subscriptionPlan.description}</p>
              )}
            </div>

            <div className="px-6 py-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  {subscriptionPlan.formatted_amount}
                </span>
                <span className="text-gray-500 ml-2">per {subscriptionPlan.interval_display}</span>
              </div>

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

              {subscriptionDetails?.has_subscription ? (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center p-4 bg-green-50 rounded-md">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Active Subscription</h3>
                      <p className="text-sm text-green-700 mt-1">
                        You have an active subscription to this plan.
                      </p>
                    </div>
                  </div>
                  
                  {subscriptionPlan.billing_portal_url && (
                    <button
                      onClick={() => window.open(subscriptionPlan.billing_portal_url, '_blank')}
                      className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Manage Billing
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-6">
                  <button
                    onClick={handleSubscriptionCheckout}
                    disabled={loading || !subscriptionPlan.can_subscribe}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Subscribe Now'}
                  </button>

                  {!subscriptionPlan.can_subscribe && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      This plan is currently not available for subscription.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { InvoicesPage };
