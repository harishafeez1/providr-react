import { ProviderCard } from './ProviderCard';

const ProvidersCard = ({ data }: any) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Providers</h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.requested_provider_companies?.map((property: any) => (
            <div className="card-border card-rounded p-1">
              <ProviderCard key={property.id} data={property} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { ProvidersCard };
