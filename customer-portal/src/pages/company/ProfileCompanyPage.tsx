import { Fragment } from 'react';
import { ProfileCompanyContent } from './';
import clsx from 'clsx';

const ProfileCompanyPage = () => {
  return (
    <Fragment>
      {/* <Container> */}
      <div className={clsx('container-fluid px-3')}>
        <ProfileCompanyContent />
      </div>
      {/* </Container> */}
    </Fragment>
  );
};

export { ProfileCompanyPage };
