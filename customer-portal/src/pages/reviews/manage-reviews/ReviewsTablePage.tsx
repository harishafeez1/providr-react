import { Fragment } from 'react';
import { Container } from '@/components/container';
import { ReviewsTableContent } from '.';

const ReviewsTablePage = () => {
  return (
    <Fragment>
      <Container>
        <ReviewsTableContent />
      </Container>
    </Fragment>
  );
};

export { ReviewsTablePage };
