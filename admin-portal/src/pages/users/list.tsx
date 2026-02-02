import { ResourceList } from '../resource-list';
import { Badge } from '@/components/ui/badge';

export function UserList() {
  return (
    <ResourceList
      resource="users"
      title="Provider Users"
      basePath="/users"
      canCreate={false}
      columns={[
        { key: 'first_name', label: 'Name', render: (_v, r) => `${r.first_name || ''} ${r.last_name || ''}`.trim() || '—' },
        { key: 'email', label: 'Email' },
        { key: 'company_name', label: 'Company', render: (_v, r) => r.provider_company?.name || '—' },
        { key: 'active', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'outline'}>{v ? 'Active' : 'Inactive'}</Badge> },
        { key: 'admin', label: 'Admin', render: (v) => v ? <Badge>Yes</Badge> : <span>No</span> },
      ]}
    />
  );
}
