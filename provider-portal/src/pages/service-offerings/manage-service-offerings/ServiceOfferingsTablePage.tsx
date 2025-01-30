import { Fragment } from 'react';

import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';

import { ServiceOfferingsTableContent } from '.';
import { Link } from 'react-router-dom';

const ServiceOfferingsTablePage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              Manage your service offerings efficiently with real-time updates
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Link to="/service-offering/add-service" className="btn btn-sm btn-primary">
              Add Service Offering
            </Link>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <ServiceOfferingsTableContent />
      </Container>
    </Fragment>
  );
};

export { ServiceOfferingsTablePage };
