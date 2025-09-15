import axios from 'axios';
import {
  GET_STRIPE_CREATE_SESSION_URL,
  POST_STRIPE_CREATE_TRIAL_SESSION_URL,
  POST_STRIPE_BILLING_PORTAL_URL,
  GET_STRIPE_SUBSCRIPTION_STATUS_URL,
  POST_STRIPE_CANCEL_SUBSCRIPTION_URL,
  POST_STRIPE_REACTIVATE_SUBSCRIPTION_URL
} from '../endpoints';

interface CreateCheckoutSessionData {
  product_id: string;
  price_id: string;
  success_url: string;
  cancel_url: string;
  provider_company_id: number;
  user_id: number;
}

interface CreateTrialSessionData {
  product_id: string;
  price_id: string;
  success_url: string;
  cancel_url: string;
  provider_company_id: number;
  user_id: number;
}

interface CreateBillingPortalSessionData {
  provider_company_id: number;
  user_id: number;
}

interface SubscriptionStatusParams {
  provider_company_id: number;
  user_id: number;
}

interface CancelSubscriptionData {
  provider_company_id: number;
  user_id: number;
  at_period_end?: boolean;
}

interface ReactivateSubscriptionData {
  provider_company_id: number;
  user_id: number;
}

const createCheckoutSession = async (data: CreateCheckoutSessionData) => {
  try {
    const response = await axios.post(GET_STRIPE_CREATE_SESSION_URL, data);
    return response.data;
  } catch (err) {
    console.error('Error creating checkout session:', err);
    throw err;
  }
};

const createTrialSession = async (data: CreateTrialSessionData) => {
  try {
    const response = await axios.post(POST_STRIPE_CREATE_TRIAL_SESSION_URL, data);
    return response.data;
  } catch (err) {
    console.error('Error creating trial session:', err);
    throw err;
  }
};

const createBillingPortalSession = async (data: CreateBillingPortalSessionData) => {
  try {
    const response = await axios.post(POST_STRIPE_BILLING_PORTAL_URL, data);
    return response.data;
  } catch (err) {
    console.error('Error creating billing portal session:', err);
    throw err;
  }
};

const getSubscriptionStatus = async (params: SubscriptionStatusParams) => {
  try {
    const response = await axios.get(GET_STRIPE_SUBSCRIPTION_STATUS_URL, { params });
    return response.data;
  } catch (err) {
    console.error('Error getting subscription status:', err);
    throw err;
  }
};

const cancelSubscription = async (data: CancelSubscriptionData) => {
  try {
    const response = await axios.post(POST_STRIPE_CANCEL_SUBSCRIPTION_URL, data);
    return response.data;
  } catch (err) {
    console.error('Error canceling subscription:', err);
    throw err;
  }
};

const reactivateSubscription = async (data: ReactivateSubscriptionData) => {
  try {
    const response = await axios.post(POST_STRIPE_REACTIVATE_SUBSCRIPTION_URL, data);
    return response.data;
  } catch (err) {
    console.error('Error reactivating subscription:', err);
    throw err;
  }
};

export {
  createCheckoutSession,
  createTrialSession,
  createBillingPortalSession,
  getSubscriptionStatus,
  cancelSubscription,
  reactivateSubscription
};