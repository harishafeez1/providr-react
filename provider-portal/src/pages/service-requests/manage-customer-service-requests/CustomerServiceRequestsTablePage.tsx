import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { CustomerServiceRequestsTableContent } from '.';

const CustomerServiceRequestsTablePage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Service Requests" />
            <ToolbarDescription>
              Manage your service offerings efficiently with real-time updates
            </ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
      </Container>

      <Container>
        <CustomerServiceRequestsTableContent />
      </Container>
    </Fragment>
  );
};

export { CustomerServiceRequestsTablePage };
