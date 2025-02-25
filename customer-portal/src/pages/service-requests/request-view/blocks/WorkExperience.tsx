import { useState } from 'react';
import { KeenIcon } from '@/components';
import clsx from 'clsx';

interface IWorkExperienceItem {
  image?: string;
  title?: string;
  desc?: string;
  date?: string;
  heading?: string;
}
interface IWorkExperienceItems extends Array<IWorkExperienceItem> {}

const WorkExperience = () => {
  const [showNumber, setShowNumber] = useState(false);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Contact Information</h3>
      </div>
      <div className="card-body">
        <div className="flex flex-col items-center gap-4 mt-4">
          <KeenIcon icon="profile-circle" className={clsx('text-[10vh] text-primary')} />{' '}
          <button
            className="btn btn-outlined text-primary border-primary flex justify-center items-center"
            onClick={() => setShowNumber(!showNumber)}
          >
            Phone:
            {showNumber ? '03024880087' : ' Click to Show Number'}
          </button>
          <div className="btn btn-outlined text-primary border-primary flex justify-center items-center">
            Email: test@test.com
          </div>
        </div>
      </div>
    </div>
  );
};

export { WorkExperience, type IWorkExperienceItem, type IWorkExperienceItems };
