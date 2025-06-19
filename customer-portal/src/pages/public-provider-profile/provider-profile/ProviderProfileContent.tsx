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

const ProviderProfileContent = () => {
  const { id } = useParams();
  const { auth } = useAuthContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [resData, setResData] = useState<any>();

  useEffect(() => {
    const fetchProvider = async () => {
      if (auth?.customer?.id) {
        const res = await getPublicProviderProfile(id, auth?.customer?.id);
        setResData(res);
      } else {
        const res = await getPublicProviderProfile(id);
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
          <div className="flex gap-4 items-center mb-4">
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
      <div className="grid grid-cols-2 gap-2 my-6">
        <div className="col-span-2 md:col-span-1">
          <ProfileInfo ProfileData={resData} />
        </div>
        <div className="col-span-2 md:col-span-1">
          {resData ? <ServicesSection Services={resData} /> : <ServicesSkeleton />}
          <Separator className="my-8 bg-black" />
          <div className="flex justify-center gap-1">
            {/* <OurQualifications /> */}
            <ConnectAndDetails DetailsData={resData} />
          </div>
          <Button
            className="w-full font-semibold text-black bg-[#D9D9D9D6]"
            onClick={handleModalchange}
          >
            Connect with provider
          </Button>
          <Separator className="my-8 bg-black" />
          <MyPortfolio PortfolioImages={resData} />
          <Separator className="my-8 bg-black" />
          <ProviderMap />
          <div className="my-4">
            <AgeGroups data={resData} />
          </div>
          .
        </div>
        <div className="col-span-2">
          <Reviews data={resData} />
        </div>
      </div>
    </div>
  );
};

export { ProviderProfileContent };
