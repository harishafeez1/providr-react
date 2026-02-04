import { ResourceList } from '../resource-list';

export function ReviewList() {
  return (
    <ResourceList
      resource="reviews"
      title="Reviews"
      basePath="/reviews"
      canCreate={false}
      canEdit={false}
      columns={[
        { key: 'reviewer_name', label: 'Reviewer', render: (_v, r) => r.customer ? `${r.customer.first_name} ${r.customer.last_name}` : '—' },
        { key: 'company_name', label: 'Company', render: (_v, r) => r.provider_company?.name || '—' },
        { key: 'rating', label: 'Rating', render: (v) => v ? `${v}/5` : '—' },
        { key: 'created_at', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
    />
  );
}
