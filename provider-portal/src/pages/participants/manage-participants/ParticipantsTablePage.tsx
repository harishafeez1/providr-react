import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/layouts/demo1/toolbar';
import { PageNavbar } from '@/pages/account';
import { ParticipantsTableContent } from './ParticipantsTableContent';

const ParticipantsTablePage = () => {
  return (
    <Fragment>
      <PageNavbar />

      <Container>
        <Toolbar>
          <ToolbarHeading title="Participants" description="Manage all participants" />
          <ToolbarActions>
            <Link to="/participants/add-participant" className="btn btn-sm btn-primary">
              Add New Participant
            </Link>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <ParticipantsTableContent />
      </Container>
    </Fragment>
  );
};

export { ParticipantsTablePage };
