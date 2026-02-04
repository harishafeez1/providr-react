import { ResourceList } from '../resource-list';

export function PromptManagementList() {
  return (
    <ResourceList
      resource="prompt-management"
      title="BSP Analysis Prompts"
      basePath="/prompt-management"
      canCreate={false}
      canEdit={true}
      canDelete={false}
      columns={[
        { key: 'section_number', label: 'Section #' },
        { key: 'section_name', label: 'Section Name' },
        {
          key: 'main_prompt',
          label: 'Main Prompt',
          render: (v: string) => v ? (v.length > 80 ? v.substring(0, 80) + '...' : v) : '—'
        },
        { key: 'updated_at', label: 'Last Updated', render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
    />
  );
}