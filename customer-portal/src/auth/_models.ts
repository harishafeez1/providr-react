import { type TLanguageCode } from '@/i18n';

export interface AuthModel {
  message?: string;
  token: string;
  user?: UserModel;
  customer?: UserModel;
}

export interface UserModel {
  id: number;
  username: string;
  password: string | undefined;
  email: string;
  first_name: string;
  last_name: string;
  fullname?: string;
  occupation?: string;
  companyName?: string;
  phone?: string;
  dob?: Date | undefined;
  ndis_number: string;
  ndis_plan_type: string;
  ndis_plan_date: Date | undefined;
  roles?: number[];
  pic?: string;
  language?: TLanguageCode;
  auth?: AuthModel;
}
