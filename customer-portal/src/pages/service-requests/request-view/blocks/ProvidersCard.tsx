import { PropertyCard } from '@/pages/directory';
import React from 'react';

const ProvidersCard = ({ data }: any) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Providers</h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-4 gap-4">
          {data?.requested_provider_companies?.map((property: any) => (
            <div className="card-border card-rounded p-2">
              <PropertyCard key={property.id} data={property} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { ProvidersCard };
