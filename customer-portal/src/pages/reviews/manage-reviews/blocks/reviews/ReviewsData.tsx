interface ServiceOfferings {
  service: {
    name: string;
  };
}

interface ProviderCompany {
  name: string;
}

interface IReviewsData {
  id: string | number;
  customer_id: string;
  status: 'active' | 'inactive';
  service_id: string | number;
  provider_company: ProviderCompany;
  service_offering: ServiceOfferings;
  content: string;
  reply: string;
  actioned_at: string;
  created_at: string;
}

export { type IReviewsData };
