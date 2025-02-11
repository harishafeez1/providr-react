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
import { AccountActivityContent } from '.';
import { useLayout } from '@/providers';

const AccountActivityPage = () => {
  const { currentLayout } = useLayout();

  return (
    <Fragment>
      <PageNavbar />

      <Container>
        <AccountActivityContent />
      </Container>
    </Fragment>
  );
};

export { AccountActivityPage };
