import { ResourceList } from '../resource-list';

export function PermissionList() {
  return (
    <ResourceList
      resource="permissions"
      title="Permissions"
      basePath="/permissions"
      canCreate={true}
      canEdit={false}
      columns={[
        { key: 'name', label: 'Permission Name' },
        { key: 'guard_name', label: 'Guard' },
        { key: 'created_at', label: 'Created', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
    />
  );
}