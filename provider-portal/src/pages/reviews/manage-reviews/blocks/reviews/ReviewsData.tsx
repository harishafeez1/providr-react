interface IReviewsData {
  id: string | number;
  provider_company_id: string | number;
  customer_id: string | number;
  customer: ICustomer;
  service_offering_id: string | number;
  service_offering: IServiceOffering;
  rating: string | number;
  content: string;
  responded: string;
  reply: string;
  created_at: string | number;
}

interface ICustomer {
  id: number;
  first_name: string;
  last_name: string | null;
}

interface IServiceOffering {
  id: number;
  active: number;
  service: {
    id: number;
    name: string;
  };
}

export { type IReviewsData };
