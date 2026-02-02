import { ResourceList } from '../resource-list';

export function ClaimRequestList() {
  return (
    <ResourceList
      resource="claim-requests"
      title="Claim Requests"
      basePath="/claim-requests"
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
