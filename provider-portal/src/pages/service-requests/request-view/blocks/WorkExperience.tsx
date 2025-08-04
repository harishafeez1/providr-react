import { useState } from 'react';
import { KeenIcon } from '@/components';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { getContactedServiceRequest, getSingleServiceRequest } from '@/services/api';
import { useAuthContext } from '@/auth';
import { useParams } from 'react-router';

interface IWorkExperienceItem {
  image?: string;
  title?: string;
  desc?: string;
  date?: string;
  heading?: string;
}
interface IWorkExperienceItems extends Array<IWorkExperienceItem> {}

const WorkExperience = ({ data, onUpdate }: any) => {
  const { id } = useParams();
  const [showNumber, setShowNumber] = useState(false);
  const { currentUser } = useAuthContext();

  const handleContactedUser = async () => {
    if (!currentUser) return;
    if (currentUser?.provider_company_id) {
      const res = await getContactedServiceRequest(currentUser?.provider_company_id, data?.id);
      if (res && id) {
        await getSingleServiceRequest(id);
        onUpdate?.();
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Contact Information</h3>
      </div>
      <div className="card-body">
        <div className="flex flex-col items-center gap-4 mt-4">
          <KeenIcon icon="profile-circle" className={clsx('text-[10vh] text-primary')} />{' '}
          <button className="btn btn-outlined text-primary border-primary flex justify-center items-center">
            Phone:
            {showNumber
              ? data?.phone
              : data?.service_request_provider?.[0].customer_contacted !== 1
                ? '**************'
                : data?.phone}
          </button>
          <div className="btn btn-outlined text-primary border-primary flex justify-center items-center">
            Email:
            {showNumber
              ? data?.email
              : data?.service_request_provider?.[0].customer_contacted !== 1
                ? '**************'
                : data?.email}
          </div>
          {(data?.service_request_provider?.[0].customer_contacted === 1 &&
            data?.direct_connect === 0) ||
          (data?.direct_connect === 1 && data?.status?.toLowerCase().trim() === 'completed') ? (
            <div className="badge badge-pill badge-success">Already Contacted</div>
          ) : (
            <>
              <Button
                onClick={() => {
                  setShowNumber(!showNumber), handleContactedUser();
                }}
                className=""
              >
                Reveal Information
              </Button>

              <div className="text-xs text-danger mt-4">
                * clicking "Reveal Information" indicates your commitment to promptly follow up with
                the customer
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { WorkExperience, type IWorkExperienceItem, type IWorkExperienceItems };
