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
  customer_id: string;
  status: 'active' | 'inactive';
  service_id: string | number;
  address: string;
  actioned_at: string;
  customer: UserModel;
  service: Services;
  service_request_provider: ServiceRequestProvider[];
}

export { type ICustomerServiceRequestsData };
