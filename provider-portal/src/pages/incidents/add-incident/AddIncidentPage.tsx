import { Fragment } from 'react';
import { AddIncidentContent } from './AddIncidentContent';
import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';

const AddIncidentPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Report New Incident" />
            <ToolbarDescription>NDIS-compliant incident reporting with AI extraction</ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
      </Container>

      <Container>
        <AddIncidentContent />
      </Container>
    </Fragment>
  );
};

export { AddIncidentPage };
