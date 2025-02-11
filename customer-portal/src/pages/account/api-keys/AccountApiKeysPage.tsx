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

import { AccountApiKeysContent } from '.';
import { useLayout } from '@/providers';

const AccountApiKeysPage = () => {
  const { currentLayout } = useLayout();

  return (
    <Fragment>
      <PageNavbar />

      <Container>
        <AccountApiKeysContent />
      </Container>
    </Fragment>
  );
};

export { AccountApiKeysPage };
