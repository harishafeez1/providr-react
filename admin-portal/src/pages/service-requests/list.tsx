import { ResourceList } from '../resource-list';
import { Badge } from '@/components/ui/badge';

export function ServiceRequestList() {
  return (
    <ResourceList
      resource="service-requests"
      title="Service Requests"
      basePath="/service-requests"
      canCreate={false}
      canEdit={false}
      columns={[
        { key: 'customer_name', label: 'Customer', render: (_v, r) => r.customer ? `${r.customer.first_name} ${r.customer.last_name}` : '—' },
        { key: 'service_name', label: 'Service', render: (_v, r) => r.service?.name || '—' },
        { key: 'status', label: 'Status', render: (v) => {
          const variant = v === 'completed' ? 'success' : v === 'pending' ? 'warning' : 'secondary';
          return <Badge variant={variant as any}>{v || '—'}</Badge>;
        }},
        { key: 'created_at', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
    />
  );
}
