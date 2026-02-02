import { ResourceList } from '../resource-list';
import { Badge } from '@/components/ui/badge';

export function CustomerList() {
  return (
    <ResourceList
      resource="customers"
      title="Customers"
      basePath="/customers"
      canCreate={false}
      columns={[
        { key: 'first_name', label: 'Name', render: (_v, r) => `${r.first_name || ''} ${r.last_name || ''}`.trim() || '—' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'active', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'outline'}>{v ? 'Active' : 'Inactive'}</Badge> },
      ]}
    />
  );
}
