import { type TLanguageCode } from '@/i18n';

export interface AuthModel {
  message?: string;
  token: string;
  user?: UserModel;
}

export interface ProviderCompany {
  id: number;
  name: string;
  business_logo: null | string;
  abn: null | string;
  description: null | string;
  organisation_type: null | string;
  registered_for_ndis: boolean;
  registered_for_ndis_early_childhood: boolean;
  company_phone: null | string;
  company_email: null | string;
  company_website: null | string;
  facebook_url: null | string;
  linkedin_url: null | string;
  instagram_url: null | string;
  twitter_url: null | string;
  photo_gallery: [] | string[];
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionPlan {
  id: number;
  stripe_product_id: string;
  stripe_price_id: string;
  name: string;
  description: string | null;
  amount: number;
  formatted_amount: string;
  currency: string; // e.g. 'aud'
  interval: string; // e.g. 'month'
  interval_count: number;
  interval_display: string; // e.g. 'month'
  can_subscribe: boolean;
  subscription_exists: boolean;
  billing_portal_url?: string;
  trial_enabled?: boolean;
  trial_period_days?: number;
  trial_description?: string | null;
  can_start_trial?: boolean;
  trial_requires_payment_method?: boolean | null;
  has_used_trial?: boolean | null;
}

export interface Subscription {
  id: number;
  stripe_subscription_id: string;
  status: string; // e.g., 'trialing', 'active', 'canceled'
  current_period_start: string;
  current_period_end: string;
  trial_start: string | null;
  trial_end: string | null;
  canceled_at: string | null;
  ended_at: string | null;
  plan_name: string;
  plan_amount: string;
  plan_interval: string;
}

export interface SubscriptionDetails {
  has_subscription: boolean;
  stripe_customer_id: string | null;
  subscription: Subscription | null;
}

export interface UserModel {
  language?: TLanguageCode;
  password?: string;
  auth?: AuthModel;
  id: number;
  email?: string;
  email_verified_at?: null | string;
  created_at?: Date;
  updated_at?: Date;
  first_name?: string;
  last_name?: string;
  phone?: string;
  job_role?: string;
  ndis?: number;
  provider_company_id?: number | string;
  active?: number;
  admin?: number;
  permission_editor?: number;
  permission_review?: number;
  permission_billing?: number;
  permission_intake?: number;
  provider_company?: ProviderCompany;
  subscription_details?: SubscriptionDetails;
  subscription_plan?: SubscriptionPlan;
}
