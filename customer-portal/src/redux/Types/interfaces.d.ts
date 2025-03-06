interface Service {
    id: number;
    name: string;
    active: number;
    created_at: string;
    updated_at: string;
  }
  
  interface ReviewStats {
    total_reviews: number;
    average_rating: number;
  }
  
  interface Pivot {
    service_request_id: number;
    provider_company_id: number;
    status: string;
    customer_contacted: number;
    created_at: string;
    updated_at: string;
  }
  
  interface ProviderCompany {
    id: number;
    name: string;
    business_logo: string;
    abn: string | null;
    description: string | null;
    organisation_type: string | null;
    registered_for_ndis: boolean;
    registered_for_ndis_early_childhood: boolean;
    company_phone: string | null;
    company_email: string | null;
    company_website: string | null;
    facebook_url: string | null;
    linkedin_url: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    photo_gallery: string | null;
    created_at: string;
    updated_at: string;
    review_stats: ReviewStats;
  }
  
  interface RequestedProviderCompany {
    id: number;
    name: string;
    business_logo: string;
    abn: string | null;
    description: string | null;
    organisation_type: string | null;
    registered_for_ndis: boolean;
    registered_for_ndis_early_childhood: boolean;
    company_phone: string | null;
    company_email: string | null;
    company_website: string | null;
    facebook_url: string | null;
    linkedin_url: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    photo_gallery: string | null;
    created_at: string;
    updated_at: string;
    review_stats: ReviewStats;
    pivot: Pivot;
  }
  
  interface IServiceRequest {
    id: number;
    provider_company_id: number;
    service_offering_id: number | null;
    service_id: number;
    customer_id: number;
    status: string;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    zip_code: string | null;
    actioned_at: string | null;
    created_at: string;
    updated_at: string;
    description: string | null;
    longitude: string | null;
    latitude: string | null;
    gender: string | null;
    first_name: string;
    last_name: string;
    service_delivered_options: string[];
    age_group_options: string[];
    phone: string;
    email: string;
    service: Service;
    provider_company: ProviderCompany;
    requested_provider_companies: RequestedProviderCompany[];
  }
  


  export {IServiceRequest}