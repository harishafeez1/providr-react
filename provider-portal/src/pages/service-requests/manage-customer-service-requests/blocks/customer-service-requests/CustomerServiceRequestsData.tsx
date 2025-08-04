import { UserModel } from '@/auth';
import { StringSchema } from 'yup';

interface Services {
  id: string | number;
  name: string;
}

interface ServiceRequestProvider {
  customer_contacted: number;
  id: number;
  provider_company_id: number;
  service_request_id: number;
  status: String;
}

interface ICustomerServiceRequestsData {
  id: string | number;
  first_name: string;
  last_name: string;
  customer_id: string;
  status: 'Pending' | 'Completed';
  service_id: string | number;
  address: string;
  actioned_at: string;
  created_at: string;
  customer: UserModel;
  service: Services;
  provider_company_id?: number | string;
  service_request_provider: ServiceRequestProvider[];
}

export { type ICustomerServiceRequestsData };
