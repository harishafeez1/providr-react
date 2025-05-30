// import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPublicProviderProfile } from '@/services/api/provider-profile';
import { useParams } from 'react-router-dom';
import ProviderDetailPage from './blocks/ProviderProfileDetail';
import { useAuthContext } from '@/auth';

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
