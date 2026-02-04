import { ResourceList } from '../resource-list';

export function NdisPromptList() {
  return (
    <ResourceList
      resource="ndis-prompts"
      title="NDIS Prompts"
      basePath="/ndis-prompts"
      canCreate={false}
      canEdit={true}
      canDelete={false}
      columns={[
        { key: 'section_number', label: 'Section #' },
        { key: 'section_name', label: 'Section Name' },
        {
          key: 'main_prompt',
          label: 'Main Prompt',
          render: (v: string) => v ? (v.length > 60 ? v.substring(0, 60) + '...' : v) : '—'
        },
        { key: 'temperature', label: 'Temperature', render: (v: number) => v?.toFixed(1) ?? '0.3' },
        { key: 'updated_at', label: 'Last Updated', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
    />
  );
}
