import { useEffect, useState } from 'react';
import {
  About,
  CompanyProfile,
  ProgressbarPoints,
  UnlockPartnerships,
  WorkExperience
} from './blocks';
import { useParams } from 'react-router-dom';

import { getInteresetedInRequest, getSingleServiceRequest } from '@/services/api';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/auth';
const RequestViewContent = () => {
  const { id } = useParams();
  const [requestData, setRequestData] = useState<any>({});
  const [updateData, setUpdateData] = useState(false);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuthContext();

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        if (!id) return;
        const response = await getSingleServiceRequest(id);
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

  const handleInterestedRequest = async () => {
    if (currentUser?.provider_company_id && id) {
      const res = await getInteresetedInRequest(currentUser?.provider_company_id, id);
      if (res) {
        setUpdateData(!updateData);
      }
    } else {
      console.log('company is present');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-7.5">
      <div className="col-span-2">
        <div className="flex flex-col gap-5 lg:gap-7.5">
          <div className="flex flex-col gap-5 lg:gap-7.5">
            <UnlockPartnerships data={requestData} />
            <ProgressbarPoints data={requestData} />
            <CompanyProfile data={requestData} />
            <About data={requestData} />
          </div>
        </div>
      </div>
      <div className="col-span-1">
        {requestData?.service_request_provider?.length > 0 ? (
          <div className="grid gap-5 lg:gap-7.5">
            <WorkExperience data={requestData} onUpdate={() => setUpdateData(!updateData)} />
          </div>
        ) : (
          <div className="flex justify-center">
            <Button onClick={() => handleInterestedRequest()} size={'lg'}>
              I'm Interested
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export { RequestViewContent };
