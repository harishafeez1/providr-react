import { ResourceList } from '../resource-list';
import { Badge } from '@/components/ui/badge';

export function AdminList() {
  return (
    <ResourceList
      resource="admins"
      title="Admin Users"
      basePath="/admins"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'roles', label: 'Roles', render: (_v, r) => (
          <div className="flex gap-1">
            {(r.roles || []).map((role: any) => (
              <Badge key={role.id || role.name} variant="secondary">{role.name}</Badge>
            ))}
          </div>
        )},
      ]}
    />
  );
}
