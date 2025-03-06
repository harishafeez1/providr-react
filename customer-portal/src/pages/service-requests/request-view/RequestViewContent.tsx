import { Separator } from '@/components/ui/separator';
import { About, CompanyProfile, ProvidersCard, UnlockPartnerships } from './blocks';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSingleServiceRequests } from '@/services/api/service-requests';
import { useAuthContext } from '@/auth';
import { RootState } from '@/redux/store';
import { useAppSelector } from '@/redux/hooks';
import ClassNameGenerator from '@mui/utils/ClassNameGenerator';

const RequestViewContent = () => {
  const { id } = useParams();
  const [requestData, setRequestData] = useState<any>({});
  const [updateData, setUpdateData] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const {serviceRequest} = useAppSelector((state: RootState) => state.serviceRequest);


  useEffect(() => {
    const fetchRequest = async () => {
      try {
        if (!id) return;
        const response = await getSingleServiceRequests(id);
        setRequestData(response);
        setLoading(false);
      } catch (err: any) {
        setLoading(false);
        throw new Error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, updateData]);

  if (loading) {
    return <></>;
  }

  return (
    <div className="flex flex-col gap-5 lg:gap-7.5">
      <div className="flex flex-col gap-5 lg:gap-7.5">
        <UnlockPartnerships data={serviceRequest} />
      </div>
      <Separator />
      <div className="">
        <ProvidersCard data={serviceRequest} />
      </div>
    </div>
  );
};

export { RequestViewContent };
