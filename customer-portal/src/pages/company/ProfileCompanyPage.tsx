import { Fragment } from 'react';
import { Container } from '@/components/container';
import { ProfileCompanyContent } from './';
import clsx from 'clsx';

const ProfileCompanyPage = () => {
  return (
    <Fragment>
      {/* <Container> */}
      <div className={clsx('container-fluid')}>
        <ProfileCompanyContent />
      </div>
      {/* </Container> */}
    </Fragment>
  );
};

export { ProfileCompanyPage };
