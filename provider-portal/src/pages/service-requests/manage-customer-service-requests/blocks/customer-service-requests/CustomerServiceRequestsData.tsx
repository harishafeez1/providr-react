interface ICustomerServiceRequestsData {
  id: string | number;
  customer_id: string;
  status: 'active' | 'inactive';
  service_id: string | number;
  address: string;
  actioned_at: string;
}

export { type ICustomerServiceRequestsData };
