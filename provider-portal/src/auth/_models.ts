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

export interface UserModel {
  language?: TLanguageCode;
  password?: string;
  auth?: AuthModel;
  id: number;
  email: string;
  email_verified_at: null | string;
  created_at: Date;
  updated_at: Date;
  first_name: string;
  last_name: string;
  phone: string;
  job_role: string;
  ndis: number;
  provider_company_id: number | string;
  active: number;
  admin: number;
  permission_editor: number;
  permission_review: number;
  permission_billing: number;
  permission_intake: number;
  provider_company: ProviderCompany;
}
