import { Fragment } from 'react';
import { Container } from '@/components/container';
import { DocumentsTableContent } from '.';

const DocumentsTablePage = () => {
  return (
    <Fragment>
      <Container>
        <DocumentsTableContent />
      </Container>
    </Fragment>
  );
};

export { DocumentsTablePage };
