import { ResourceList } from '../resource-list';

export function CustomerDocumentList() {
  return (
    <ResourceList
      resource="customer-documents"
      title="Customer Documents"
      basePath="/customer-documents"
      canCreate={false}
      canEdit={true}
      columns={[
        { key: 'document_name', label: 'Document Name' },
        {
          key: 'customer',
          label: 'Customer',
          render: (_: any, record: any) => record.customer?.name || record.customer?.email || '—'
        },
        { key: 'created_at', label: 'Uploaded', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
    />
  );
}