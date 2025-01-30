import { Fragment } from 'react';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { Container } from '@/components/container';
import { AddServiceOfferingContent } from './AddServiceOfferingContent';

const AddServiceOfferingPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Create New Service Offering" />
            <ToolbarDescription>
              Add your Service Offering efficiently with real-time updates
            </ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
      </Container>

      <Container>
        <AddServiceOfferingContent />
      </Container>
    </Fragment>
  );
};

export { AddServiceOfferingPage };
