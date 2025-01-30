import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading } from '@/partials/toolbar';
import { Link } from 'react-router-dom';

const SpecialisationsPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <h1 className="text-xl font-medium leading-none text-gray-900">
              Provider Specialisations
            </h1>
          </ToolbarHeading>
        </Toolbar>

        <div className="flex flex-col ">
          <h1 className="text-2xl font-medium leading-none text-primary-500">
            This feature is only for accredited providers!
          </h1>
          <div className="p-2">
            <p>Upgrade your account and get access to Accredited-only perks including:</p>
            <ul className="list-disc list-inside p-2">
              <li>Access to Provider Specialisations</li>
              <li>Access to Provider Reports</li>
              <li>Access to Provider Dashboard</li>
            </ul>
          </div>
        </div>
        <Link to="/billing" className="btn btn-sm btn-primary">
          Get Accredited
          <i className="ki-outline ki-plus-squared"></i>
        </Link>
      </Container>
    </Fragment>
  );
};

export { SpecialisationsPage };
