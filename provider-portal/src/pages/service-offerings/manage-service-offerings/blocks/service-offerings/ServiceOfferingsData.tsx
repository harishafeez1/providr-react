interface Servicesobject {
  active: number;
  id: number;
  name: string;
}

interface IServiceOfferingsData {
  id: string | number;
  service_id: string;
  service: Servicesobject;
  description: string;
  age_group_options: string | [];
  language_options: string | [];
  service_delivered_options: any;
  service_available_options: string | [];
  active: boolean | number;
  created_at: string;
}

export { type IServiceOfferingsData };
