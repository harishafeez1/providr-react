import { Fragment } from 'react';

import { PageNavbar } from '@/pages/account';
import { EditPremisesContent } from './EditPremisesContent';

const EditPremisesPage = () => {
  return (
    <Fragment>
      <PageNavbar />
      <EditPremisesContent />
    </Fragment>
  );
};

export { EditPremisesPage };
