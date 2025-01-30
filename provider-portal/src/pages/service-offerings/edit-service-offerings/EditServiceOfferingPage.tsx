import { Fragment } from 'react';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { Container } from '@/components/container';
import { EditServiceOfferingContent } from './EditServiceOfferingContent';

const EditServiceOfferingPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Edit Service Offering" />
            <ToolbarDescription>
              Edit your Service Offering efficiently with real-time updates
            </ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
      </Container>

      <Container>
        <EditServiceOfferingContent />
      </Container>
    </Fragment>
  );
};

export { EditServiceOfferingPage };
