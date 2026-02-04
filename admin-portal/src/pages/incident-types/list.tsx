import { ResourceList } from '../resource-list';

export function IncidentTypeList() {
  return (
    <ResourceList
      resource="incident-types"
      title="Incident Types"
      basePath="/incident-types"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'active', label: 'Active', render: (v) => v ? 'Yes' : 'No' },
      ]}
    />
  );
}
