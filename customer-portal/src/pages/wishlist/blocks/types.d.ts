interface ICompanyProfile {
    id: number;
    name: string;
    abn: string | null;
    organisation_type: 'sole_trader' | 'company' | string;
    business_logo: string;
    company_email: string;
    company_phone: string;
    company_website: string;
    description: string;
    facebook_url: string | null;
    instagram_url: string | null;
    linkedin_url: string | null;
    twitter_url: string | null;
    registered_for_ndis: boolean;
    registered_for_ndis_early_childhood: boolean;
    photo_gallery: string[];
    review_stats: {
      total_reviews: number;
      average_rating: number;
    };
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
  }
  

interface IWishlistTableProps {

    id: number;
    provider_company_id: number;
    customer_id: number;
    created_at: string;
    provider_company: ICompanyProfile
}



export { IWishlistTableProps, ICompanyProfile };