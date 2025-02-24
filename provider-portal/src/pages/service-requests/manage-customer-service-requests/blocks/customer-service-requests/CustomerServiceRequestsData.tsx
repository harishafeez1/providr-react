import { UserModel } from '@/auth';

interface Services {
  id: string | number;
  name: string;
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
}

export { type ICustomerServiceRequestsData };
