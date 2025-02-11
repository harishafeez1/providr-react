import { Fragment } from 'react';

import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { PageNavbar } from '@/pages/account';

import { AccountBasicContent } from '.';
import { useLayout } from '@/providers';

const AccountBasicPage = () => {
  const { currentLayout } = useLayout();

  return (
    <Fragment>
      <PageNavbar />

      <Container>
        <AccountBasicContent />
      </Container>
    </Fragment>
  );
};

export { AccountBasicPage };
