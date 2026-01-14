import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { PageNavbar } from '@/pages/account';
import { AddParticipantContent } from './AddParticipantContent';

const AddParticipantPage = () => {
  return (
    <Fragment>
      <PageNavbar />

      <Container>
        <Toolbar>
          <ToolbarHeading title="Add Participant" description="Create a new participant record" />
          <ToolbarActions>
            <Link to="/participants" className="btn btn-sm btn-primary">
              <i className="ki-outline ki-left text-base"></i>
              Back to Participants
            </Link>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <AddParticipantContent />
      </Container>
    </Fragment>
  );
};

export { AddParticipantPage };
