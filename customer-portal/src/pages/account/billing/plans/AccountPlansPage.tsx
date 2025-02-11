import { Fragment } from 'react';
import { Container } from '@/components/container';
import { PageNavbar } from '@/pages/account';
import { AccountPlansContent } from '.';

const AccountPlansPage = () => {
  return (
    <Fragment>
      <PageNavbar />

      <Container>
        <AccountPlansContent />
      </Container>
    </Fragment>
  );
};

export { AccountPlansPage };
