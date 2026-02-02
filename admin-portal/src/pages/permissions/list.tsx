import { ResourceList } from '../resource-list';

export function PermissionList() {
  return (
    <ResourceList
      resource="permissions"
      title="Permissions"
      basePath="/permissions"
      canCreate={false}
      canEdit={false}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'guard_name', label: 'Guard' },
        { key: 'created_at', label: 'Created', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
    />
  );
}
