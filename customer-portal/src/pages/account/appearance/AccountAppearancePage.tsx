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

import { AccountAppearanceContent } from '.';
import { useLayout } from '@/providers';

const AccountAppearancePage = () => {
  const { currentLayout } = useLayout();

  return (
    <Fragment>
      <PageNavbar />

      <Container>
        <AccountAppearanceContent />
      </Container>
    </Fragment>
  );
};

export { AccountAppearancePage };
