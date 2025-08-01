import { ProviderCard } from './ProviderCard';

const ProvidersCard = ({ data }: any) => {
  const providers = Array.isArray(data?.requested_provider_companies)
    ? data.requested_provider_companies
    : [];
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Interested Providers</h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {providers?.map((provider: any) => (
            <div key={provider.id} className="">
              <ProviderCard data={provider} comapnyId={data?.provider_company_id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { ProvidersCard };
