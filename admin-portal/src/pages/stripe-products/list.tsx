import { ResourceList } from '../resource-list';

const activeBadge = (active: boolean) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
};

export function StripeProductList() {
  return (
    <ResourceList
      resource="stripe-products"
      title="Stripe Products"
      basePath="/stripe-products"
      canCreate={true}
      canEdit={true}
      columns={[
        { key: 'name', label: 'Product Name' },
        { key: 'formatted_amount', label: 'Amount' },
        { key: 'interval_display', label: 'Billing Interval' },
        { key: 'active', label: 'Status', render: (v: boolean) => activeBadge(v) },
        {
          key: 'stripe_configuration',
          label: 'Environment',
          render: (_: any, record: any) => record.stripe_configuration?.environment || '—'
        },
        { key: 'created_at', label: 'Created', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
    />
  );
}