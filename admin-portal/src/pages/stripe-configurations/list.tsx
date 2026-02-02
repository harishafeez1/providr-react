import { ResourceList } from '../resource-list';

export function StripeConfigurationList() {
  return (
    <ResourceList
      resource="stripe-configurations"
      title="Stripe Configurations"
      basePath="/stripe-configurations"
      canCreate={false}
      canEdit={false}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'created_at', label: 'Created', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
    />
  );
}
