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

  return (
    <div className="min-h-screen bg-white text-black font-montserrat">
      <ConnectProviderModal open={isModalOpen} onOpenChange={handleModalchange} />
      {/* <ProviderDetailPage data={resData} loading={loading} /> */}
      <div className="grid grid-cols-2 gap-2 my-6">
        <div className="col-span-2 md:col-span-1">
          <ProfileInfo ProfileData={resData} />
        </div>
        <div className="col-span-2 md:col-span-1">
          <ServicesSection Services={resData} />
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
        </div>
      </div>
    </div>
  );
};

export { ProviderProfileContent };
