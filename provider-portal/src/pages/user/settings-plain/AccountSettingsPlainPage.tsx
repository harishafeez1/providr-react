import { Fragment } from 'react';
import { Container } from '@/components/container';
import { PageNavbar } from '@/pages/account';
import { AccountSettingsPlainContent } from '.';

const AccountSettingsPlainPage = () => {
  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <AccountSettingsPlainContent />
      </Container>
    </Fragment>
  );
};

export { AccountSettingsPlainPage };
