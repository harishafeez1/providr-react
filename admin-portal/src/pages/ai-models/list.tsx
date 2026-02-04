import { ResourceList } from '../resource-list';

const activeBadge = (active: boolean) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
};

export function AIModelList() {
  return (
    <ResourceList
      resource="ai-models"
      title="AI Models"
      basePath="/ai-models"
      canCreate={true}
      canEdit={true}
      columns={[
        { key: 'model_name', label: 'Model Name' },
        { key: 'api_key_masked', label: 'API Key' },
        { key: 'is_active', label: 'Status', render: (v: boolean) => activeBadge(v) },
        { key: 'created_at', label: 'Created', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
    />
  );
}