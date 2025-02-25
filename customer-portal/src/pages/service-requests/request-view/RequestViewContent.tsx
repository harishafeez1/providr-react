import { About, CompanyProfile, ProgressbarPoints, UnlockPartnerships } from './blocks';

const RequestViewContent = () => {
  return (
    <div className="flex flex-col gap-5 lg:gap-7.5">
      <div className="flex flex-col gap-5 lg:gap-7.5">
        <ProgressbarPoints />
        <UnlockPartnerships />
        <CompanyProfile />
        <About />
      </div>
    </div>
  );
};

export { RequestViewContent };
