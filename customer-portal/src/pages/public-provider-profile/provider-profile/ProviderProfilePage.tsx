import { Container } from '@/components/container';

import { ProviderProfileContent } from '.';
import { Separator } from '@/components/ui/separator';

const ProviderProfilePage = () => {
  return (
    <>
      <Separator className="my-4 bg-black" />
      <Container>
        <ProviderProfileContent />
      </Container>
    </>
  );
};

export { ProviderProfilePage };
