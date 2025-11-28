import { Fragment } from 'react';
import { AddIncidentContent } from './AddIncidentContent';
import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/toolbar';

const AddIncidentPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Report New Incident"
            description="NDIS-compliant incident reporting with AI extraction"
          />
        </Toolbar>
      </Container>

      <Container>
        <AddIncidentContent />
      </Container>
    </Fragment>
  );
};

export { AddIncidentPage };
