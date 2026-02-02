import { ResourceList } from '../resource-list';

export function CustomerDocumentList() {
  return (
    <ResourceList
      resource="customer-documents"
      title="Customer Documents"
      basePath="/customer-documents"
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
