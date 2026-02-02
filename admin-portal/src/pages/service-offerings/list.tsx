import { ResourceList } from '../resource-list';

export function ServiceOfferingList() {
  return (
    <ResourceList
      resource="service-offerings"
      title="Service Offerings"
      basePath="/service-offerings"
      canCreate={false}
      columns={[
        { key: 'company_name', label: 'Company', render: (_v, r) => r.provider_company?.name || '—' },
        { key: 'service_name', label: 'Service', render: (_v, r) => r.service?.name || '—' },
        { key: 'price_from', label: 'Price From', render: (v) => v ? `$${v}` : '—' },
        { key: 'price_to', label: 'Price To', render: (v) => v ? `$${v}` : '—' },
      ]}
    />
  );
}
