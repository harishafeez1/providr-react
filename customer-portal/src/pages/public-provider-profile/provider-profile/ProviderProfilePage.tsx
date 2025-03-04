import { Fragment } from 'react';
import { Container } from '@/components/container';

import { ProviderProfileContent } from '.';
import { Provider } from '@radix-ui/react-tooltip';

const ProviderProfilePage = () => {
  return (
    <Fragment>
      <Container>
        <ProviderProfileContent />
      </Container>
    </Fragment>
  );
};

export { ProviderProfilePage };
