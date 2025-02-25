import { Fragment } from 'react';
import { Container } from '@/components/container';
import { RequestViewContent } from './RequestViewContent';

const RequestViewPage = () => {
  return (
    <Fragment>
      <Container>
        <RequestViewContent />
      </Container>
    </Fragment>
  );
};

export { RequestViewPage };
