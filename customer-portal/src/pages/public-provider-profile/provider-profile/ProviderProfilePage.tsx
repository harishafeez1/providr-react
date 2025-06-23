import { Container } from '@/components/container';

import { ProviderProfileContent } from '.';
import { Separator } from '@/components/ui/separator';

const ProviderProfilePage = () => {
  return (
    <div className="col-span-12">
      <Container>
        <ProviderProfileContent />
      </Container>
    </div>
  );
};

export { ProviderProfilePage };
