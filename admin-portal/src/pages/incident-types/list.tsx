import { ResourceList } from '../resource-list';

export function IncidentTypeList() {
  return (
    <ResourceList
      resource="incident-types"
      title="Incident Types"
      basePath="/incident-types"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'incidents_count', label: 'Incidents', render: (v) => v ?? '—' },
      ]}
    />
  );
}
