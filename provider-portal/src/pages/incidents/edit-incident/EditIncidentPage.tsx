import { Fragment } from 'react';
import { EditIncidentContent } from './EditIncidentContent';
import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';

const EditIncidentPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Edit Incident Report" />
            <ToolbarDescription>Update incident details and information</ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
      </Container>

      <Container>
        <EditIncidentContent />
      </Container>
    </Fragment>
  );
};

export { EditIncidentPage };
