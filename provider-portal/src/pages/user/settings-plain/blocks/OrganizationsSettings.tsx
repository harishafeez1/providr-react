import { OrganizationsTable } from './orgnizations';

const OrganizationsSettings = () => {
  return (
    <div className="card pb-2.5">
      <div className="card-header" id="general_settings">
        <h3 className="card-title">Organizations</h3>
      </div>
      <div className="card-body grid gap-5">
        <OrganizationsTable />
      </div>
    </div>
  );
};

export { OrganizationsSettings };
