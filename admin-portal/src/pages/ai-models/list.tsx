import { ResourceList } from '../resource-list';

export function AIModelList() {
  return (
    <ResourceList
      resource="ai-models"
      title="AI Models"
      basePath="/ai-models"
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
