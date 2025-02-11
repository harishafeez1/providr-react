import { Fragment } from 'react';
import { Container } from '@/components/container';
import { ServiceRequestsTableContent } from '.';

const ServiceRequestsTablePage = () => {
  return (
    <Fragment>
      <Container>
        <ServiceRequestsTableContent />
      </Container>
    </Fragment>
  );
};

export { ServiceRequestsTablePage };
