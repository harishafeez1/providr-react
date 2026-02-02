import { ResourceList } from '../resource-list';

export function ProviderCompanyImportList() {
  return (
    <ResourceList
      resource="provider-company-imports"
      title="Provider Company Imports"
      basePath="/provider-company-imports"
      canCreate={false}
      canEdit={false}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'status', label: 'Status' },
        { key: 'created_at', label: 'Created', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
    />
  );
}
