interface Service {
  name: string;
}
interface ProviderCompany {
  name: string;
}

interface IServiceRequestsData {
  id: string | number;
  customer_id: string;
  status: 'active' | 'inactive';
  service_id: string | number;
  service: Service;
  provider_company_id: string | number;
  provider_company: ProviderCompany;
  address: string;
  actioned_at: string;
}

export { type IServiceRequestsData };
