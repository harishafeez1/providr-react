import { ResourceList } from '../resource-list';

export function RoleList() {
  return (
    <ResourceList
      resource="roles"
      title="Roles"
      basePath="/roles"
      canCreate={true}
      canEdit={true}
      columns={[
        { key: 'name', label: 'Role Name' },
        { key: 'guard_name', label: 'Guard' },
        { key: 'permissions_count', label: 'Permissions', render: (v: number) => v ?? 0 },
        { key: 'created_at', label: 'Created', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
    />
  );
}
