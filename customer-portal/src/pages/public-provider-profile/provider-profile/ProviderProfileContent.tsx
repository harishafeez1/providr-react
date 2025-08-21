// import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPublicProviderProfile } from '@/services/api/provider-profile';
import { useParams } from 'react-router-dom';
import ProviderDetailPage from './blocks/ProviderProfileDetail';
import { useAuthContext } from '@/auth';
import { ConnectProviderModal, MyPortfolio, ProfileInfo, ServicesSection } from './blocks';
import ConnectAndDetails from './blocks/ConnectAndDetails';
import OurQualifications from './blocks/OurQualifications';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProviderMap } from './blocks/ProviderMap';
import { AgeGroups } from './blocks/AgeGroups';
import { Reviews } from './blocks/Reviews';
import { store } from '@/redux/store';
import { setMobileProfileLoading, setProviderProfile } from '@/redux/slices/provider-profile-slice';

const ProviderProfileContent = () => {
  const { id } = useParams();
  const { auth } = useAuthContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [resData, setResData] = useState<any>();

  useEffect(() => {
    const fetchProvider = async () => {
      store.dispatch(setMobileProfileLoading(true));
      if (auth?.customer?.id) {
        const res = await getPublicProviderProfile(id, auth?.customer?.id);
        store.dispatch(setProviderProfile(res));
        store.dispatch(setMobileProfileLoading(false));
        setResData(res);
      } else {
        const res = await getPublicProviderProfile(id);
        store.dispatch(setProviderProfile(res));
        store.dispatch(setMobileProfileLoading(false));
        setResData(res);
      }
    };
    try {
      setLoading(true);
      fetchProvider();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalchange = () => {
    setIsModalOpen(!isModalOpen);
  };

  function ServicesSkeleton() {
    return (
      <div className="animate-pulse">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="flex gap-4 items-center mb-4" key={index}>
            {/* Left box */}
            <div className="h-[120px] w-[140px] bg-gray-200 rounded-3xl" />

            {/* Right box with stacked lines */}
            <div className="flex flex-col space-y-3">
              <div className="h-[30px] w-[150px] bg-gray-200 rounded-lg" />
              <div className="h-[20px] lg:w-[200%] bg-gray-200 rounded-lg" />
              <div className="h-[20px] lg:w-[200%] bg-gray-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-montserrat">
      <ConnectProviderModal open={isModalOpen} onOpenChange={handleModalchange} />
      {/* <ProviderDetailPage data={resData} loading={loading} /> */}
      <div className="hidden md:grid grid-cols-12 gap-10 my-2">
        <div className="col-span-12 md:col-span-5">
          <div className="sticky top-44">
            <ProfileInfo ProfileData={resData} />
          </div>
        </div>
        <div className="col-span-12 md:col-span-7">
          {resData ? <ServicesSection Services={resData} /> : <ServicesSkeleton />}
          <Separator className="mt-6 " />
          <div className="flex flex-col lg:flex-row justify-center items-center gap-1">
            <OurQualifications data={resData} />
            <ConnectAndDetails DetailsData={resData} />
          </div>
          <Button
            className="w-full mt-1 font-semibold text-black bg-[#F2F2F2] hover:bg-[#F7F7F7] transition"
            onClick={handleModalchange}
          >
            Connect with provider
          </Button>
          <Separator className="my-9 " />
          <MyPortfolio PortfolioImages={resData} />
          <Separator className="my-10 " />

          <Reviews data={resData} />

          {resData?.premises && resData.premises.length > 0 && (
            <>
              <Separator className="my-10 " />
              <ProviderMap premises={resData.premises} />
              <Separator className="my-10 " />
            </>
          )}

          <AgeGroups data={resData} />
        </div>
        <div className="col-span-12"></div>
      </div>
    </div>
  );
};

export { ProviderProfileContent };
