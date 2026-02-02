import { ResourceList } from '../resource-list';

export function PromptManagementList() {
  return (
    <ResourceList
      resource="prompt-management"
      title="Prompt Management"
      basePath="/prompt-management"
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
