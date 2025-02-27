import { useEffect, useState } from 'react';
import {
  About,
  CompanyProfile,
  ProgressbarPoints,
  UnlockPartnerships,
  WorkExperience
} from './blocks';
import { useParams } from 'react-router-dom';

import { getSingleServiceRequest } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

const RequestViewContent = () => {
  const { id } = useParams();
  const [requestData, setRequestData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const response = await getSingleServiceRequest(id);
        setRequestData(response);
      } catch (err: any) {
        setLoading(false);
        throw new Error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  if (loading) {
    return <Skeleton />;
  }

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
        <div className="grid gap-5 lg:gap-7.5">
          <WorkExperience data={requestData} />
        </div>
      </div>
    </div>
  );
};

export { RequestViewContent };
