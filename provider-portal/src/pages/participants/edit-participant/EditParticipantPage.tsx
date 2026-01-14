import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { PageNavbar } from '@/pages/account';
import { EditParticipantContent } from './EditParticipantContent';

const EditParticipantPage = () => {
  return (
    <Fragment>
      <PageNavbar />

      <Container>
        <Toolbar>
          <ToolbarHeading title="Edit Participant" description="Update participant information" />
          <ToolbarActions>
            <Link to="/participants" className="btn btn-sm btn-primary">
              <i className="ki-outline ki-left text-base"></i>
              Back to Participants
            </Link>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <EditParticipantContent />
      </Container>
    </Fragment>
  );
};

export { EditParticipantPage };
