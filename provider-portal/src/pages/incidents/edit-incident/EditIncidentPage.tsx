import { Fragment } from 'react';
import { EditIncidentContent } from './EditIncidentContent';
import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/toolbar';

const EditIncidentPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Edit Incident Report"
            description="Update incident details and information"
          />
        </Toolbar>
      </Container>

      <Container>
        <EditIncidentContent />
      </Container>
    </Fragment>
  );
};

export { EditIncidentPage };
