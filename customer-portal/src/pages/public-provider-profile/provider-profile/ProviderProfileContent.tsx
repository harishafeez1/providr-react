// import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPublicProviderProfile } from '@/services/api/provider-profile';
import { useParams } from 'react-router-dom';
import ProviderDetailPage from './blocks/ProviderProfileDetail';

const ProviderProfileContent = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState<boolean>(false);
  const [resData, setResData] = useState<any>();

  useEffect(() => {
    const fetchProvider = async () => {
      const res = await getPublicProviderProfile(id);

      setResData(res);
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

  // if (loading) {
  //   <></>;
  // }

  return (
    <>
      <ProviderDetailPage data={resData} loading={loading} />
    </>
  );
};

export { ProviderProfileContent };
