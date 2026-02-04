import { ResourceList } from '../resource-list';

const environmentBadge = (env: string) => {
  const colors: Record<string, string> = {
    test: 'bg-yellow-100 text-yellow-800',
    production: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[env] || 'bg-gray-100 text-gray-800'}`}>
      {env}
    </span>
  );
};

const activeBadge = (active: boolean) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
};

export function StripeConfigurationList() {
  return (
    <ResourceList
      resource="stripe-configurations"
      title="Stripe Configurations"
      basePath="/stripe-configurations"
      canCreate={true}
      canEdit={true}
      columns={[
        { key: 'environment', label: 'Environment', render: (v: string) => environmentBadge(v) },
        { key: 'active', label: 'Status', render: (v: boolean) => activeBadge(v) },
        { key: 'trial_enabled', label: 'Trial', render: (v: boolean) => v ? 'Enabled' : 'Disabled' },
        { key: 'trial_period_days', label: 'Trial Days', render: (v: number) => v ?? '—' },
        { key: 'products_count', label: 'Products', render: (v: number) => v ?? 0 },
        { key: 'created_at', label: 'Created', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
    />
  );
}