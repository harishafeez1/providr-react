import { ResourceList } from '../resource-list';

const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

export function ProviderCompanyImportList() {
  return (
    <ResourceList
      resource="provider-company-imports"
      title="Provider Company Imports"
      basePath="/provider-company-imports"
      canCreate={false}
      canEdit={false}
      columns={[
        { key: 'csv_file_name', label: 'File Name' },
        { key: 'status', label: 'Status', render: (v: string) => statusBadge(v) },
        { key: 'start_row', label: 'Start Row' },
        { key: 'end_row', label: 'End Row' },
        { key: 'successful_rows', label: 'Successful', render: (v: number) => v ?? 0 },
        { key: 'failed_rows', label: 'Failed', render: (v: number) => v ?? 0 },
        { key: 'created_at', label: 'Created', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
    />
  );
}