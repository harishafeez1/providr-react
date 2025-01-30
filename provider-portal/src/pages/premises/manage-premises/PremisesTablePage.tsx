import { Fragment } from 'react';

import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';

import { PremisesTableContent } from '.';
import { Link } from 'react-router-dom';

const PremisesTablePage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              Manage your Premises efficiently with real-time updates
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Link to="/premises/add-premises" className="btn btn-sm btn-primary">
              Add New Premises
            </Link>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <PremisesTableContent />
      </Container>
    </Fragment>
  );
};

export { PremisesTablePage };
