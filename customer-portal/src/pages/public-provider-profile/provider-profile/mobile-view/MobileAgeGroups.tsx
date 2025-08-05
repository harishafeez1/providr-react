import { useAppSelector } from '@/redux/hooks';
import React from 'react';

const MobileAgeGroups = () => {
  const { providerProfile } = useAppSelector((state: any) => state.providerProfile);
  return (
    <div className="card">
      <div className="card-title text-center my-4">Age Groups</div>
      <div className="card-body grid grid-cols-1 p-4 items-start gap-4">
        {providerProfile?.age_group_collection?.map((option: any, index: number) => (
          <div key={index} className="badge badge-gray-100 text-center">
            <div className="flex-1 text-black font-semibold">{option}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { MobileAgeGroups };
