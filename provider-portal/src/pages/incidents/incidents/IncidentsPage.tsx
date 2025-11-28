import { Fragment, useEffect, useState } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/layouts/demo1/toolbar';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
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
          <ToolbarHeading
            title="Incidents"
            description="Manage incidents efficiently with real-time updates"
          />
           <ToolbarActions>
              <Button variant="default" size="sm" asChild>

            <Link to="/incidents/add-incident" className="btn btn-sm btn-primary">
              <i className="ki-outline ki-plus text-base"></i>
              Add Incident
            </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      {/* Success Message */}
      {successMessage && (
        <Container>
          <div className="alert alert-success mb-5 dark:bg-success/10">
            <div className="flex items-start gap-3">
              <KeenIcon icon="check-circle" className="ki-outline text-lg text-success dark:text-success-light" />
              <span className="text-sm text-gray-900 dark:text-gray-100">{successMessage}</span>
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
