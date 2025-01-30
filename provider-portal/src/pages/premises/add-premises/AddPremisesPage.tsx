import { Fragment } from 'react';
import { AddPremisesContent } from './AddPremisesContent';
import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

const AddPremisesPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Add Premises" />
            <ToolbarDescription>
              Add your Premises efficiently with real-time updates
            </ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
      </Container>

      <Container>
        <AddPremisesContent />
      </Container>
    </Fragment>
  );
};

export { AddPremisesPage };
