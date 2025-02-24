import { OpenJobs, Locations } from './blocks';

const ProfileCompanyContent = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-7.5">
      <div className="col-span-1">
        <div className="flex flex-col gap-5 lg:gap-7.5">
          <OpenJobs />
        </div>
      </div>
      <div className="col-span-1 lg:col-span-3">
        <div className="flex flex-col gap-5 lg:gap-7.5">
          <Locations />
        </div>
      </div>
    </div>
  );
};

export { ProfileCompanyContent };
