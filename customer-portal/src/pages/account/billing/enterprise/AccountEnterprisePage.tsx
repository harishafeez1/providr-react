import { Fragment } from 'react';

import { Container } from '@/components/container';

import { PageNavbar } from '@/pages/account';

import { AccountEnterpriseContent } from '.';

const AccountEnterprisePage = () => {
  return (
    <Fragment>
      <PageNavbar />

      <Container>
        <AccountEnterpriseContent />
      </Container>
    </Fragment>
  );
};

export { AccountEnterprisePage };
