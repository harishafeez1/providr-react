import { ResourceList } from '../resource-list';

const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

export function ClaimRequestList() {
  return (
    <ResourceList
      resource="claim-requests"
      title="Claim Requests"
      basePath="/claim-requests"
      canCreate={false}
      canEdit={false}
      columns={[
        { key: 'company_name', label: 'Company Name' },
        { key: 'email', label: 'Email' },
        { key: 'company_website', label: 'Website', render: (v: string) => v || '—' },
        { key: 'status', label: 'Status', render: (v: string) => statusBadge(v) },
        { key: 'created_at', label: 'Requested At', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
    />
  );
}