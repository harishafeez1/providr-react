import { Fragment } from 'react';

import { PageNavbar } from '@/pages/account';
import { EditPremisesContent } from './EditPremisesContent';
import { Container } from '@/components';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

const EditPremisesPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Edit Premises" />
            <ToolbarDescription>
              Edit your Premises efficiently with real-time updates
            </ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
      </Container>
      <Container>
        <PageNavbar />
        <EditPremisesContent />
      </Container>
    </Fragment>
  );
};

export { EditPremisesPage };
