// import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPublicProviderProfile } from '@/services/api/provider-profile';
import { useParams } from 'react-router-dom';
import ProviderDetailPage from './blocks/ProviderProfileDetail';

const ProviderProfileContent = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState<boolean>(true);
  const [resData, setResData] = useState<any>();

  useEffect(() => {
    const fetchProvider = async () => {
      const res = await getPublicProviderProfile(id);

      setResData(res);
    };
    try {
      fetchProvider();
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return (
    <>
      <ProviderDetailPage data={resData} />
    </>
  );
};

export { ProviderProfileContent };
