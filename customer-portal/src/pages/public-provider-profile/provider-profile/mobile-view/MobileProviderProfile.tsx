import { Separator } from '@/components/ui/separator';
import { BannerImgSection } from './BannerImgSection';
import { MobileProfileInfo } from './MobileProfileInfo';
import { MobileServicesSection } from './MobileServicesSection';
import { MobileQualifications } from './MobileQualifications';
import { MobileMyPortfolio } from './MobileMyPortfolio';
import { MobileReviews } from './MobileReviews';

const MobileProviderProfile = () => {
  return (
    <>
      <div className="grid grid-cols-12 gap-4 font-montserrat ">
        <div className="col-span-12 text-black">
          <div className="relative">
            <BannerImgSection />
          </div>
          <div className="card bg-white shadow-lg px-6 absolute top-[168px] rounded-[32px] pb-4">
            <div className="mb-2">
              <MobileProfileInfo />
            </div>
            <Separator className="my-4" />
            <div className="mt-2">
              <MobileServicesSection />
            </div>
            <Separator className="my-3" />
            <div className="mt-3">
              <MobileQualifications />
            </div>
            <Separator className="mt-10" />
            <div className="">
              <MobileMyPortfolio />
            </div>
            <Separator className="my-4" />
            <div className="mt-2">
              <MobileReviews />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { MobileProviderProfile };
