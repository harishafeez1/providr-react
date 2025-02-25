import {
  About,
  CompanyProfile,
  ProgressbarPoints,
  UnlockPartnerships,
  WorkExperience
} from './blocks';

const RequestViewContent = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-7.5">
      <div className="col-span-2">
        <div className="flex flex-col gap-5 lg:gap-7.5">
          <div className="flex flex-col gap-5 lg:gap-7.5">
            <ProgressbarPoints />
            <UnlockPartnerships />
            <CompanyProfile />
            <About />
          </div>
        </div>
      </div>
      <div className="col-span-1">
        <div className="grid gap-5 lg:gap-7.5">
          <WorkExperience />
        </div>
      </div>
    </div>
  );
};

export { RequestViewContent };
