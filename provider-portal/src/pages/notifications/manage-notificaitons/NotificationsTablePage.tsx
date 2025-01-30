import { Fragment } from 'react';

import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

import { NotificationsTableContent } from '.';

const NotificationsTablePage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Manage Notifications" />
            <ToolbarDescription>
              Manage your notifications and view notification history
            </ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
      </Container>

      <Container>
        <NotificationsTableContent />
      </Container>
    </Fragment>
  );
};

export { NotificationsTablePage };
