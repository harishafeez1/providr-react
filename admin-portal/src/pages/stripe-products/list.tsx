import { ResourceList } from '../resource-list';

export function StripeProductList() {
  return (
    <ResourceList
      resource="stripe-products"
      title="Stripe Products"
      basePath="/stripe-products"
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
