import { Fragment, useEffect, useState } from 'react';
import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { Link, useLocation } from 'react-router-dom';

import { IncidentsTableContent } from './';

const IncidentsPage = () => {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              Manage incidents efficiently with real-time updates
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Link to="/incidents/add-incident" className="btn btn-sm btn-primary">
              <i className="ki-outline ki-plus text-base"></i>
              Add Incident
            </Link>
          </ToolbarActions>
        </Toolbar>
      </Container>

      {/* Success Message */}
      {successMessage && (
        <Container>
          <div className="alert alert-success mb-5">
            <div className="flex items-start gap-3">
              <i className="ki-outline ki-check-circle text-lg text-success"></i>
              <span className="text-sm text-gray-900">{successMessage}</span>
            </div>
          </div>
        </Container>
      )}

      <Container>
        <IncidentsTableContent />
      </Container>
    </Fragment>
  );
};

export { IncidentsPage };
