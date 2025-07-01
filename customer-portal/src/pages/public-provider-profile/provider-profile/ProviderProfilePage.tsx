import { Container } from '@/components/container';

import { ProviderProfileContent } from '.';
import { MobileProviderProfile } from './mobile-view';

const ProviderProfilePage = () => {
  return (
    <div className="col-span-12">
      <Container className="hidden md:block">
        <ProviderProfileContent />
      </Container>

      <div className="md:hidden bg-[#f4f2ec] h-full overflow-x-hidden">
        <MobileProviderProfile />
      </div>
    </div>
  );
};

export { ProviderProfilePage };
