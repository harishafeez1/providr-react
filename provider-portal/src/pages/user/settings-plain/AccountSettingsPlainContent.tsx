import { BasicSettings } from './blocks';

const AccountSettingsPlainContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5 xl:w-[68.75rem] mx-auto">
      {/* <OrganizationsSettings /> */}
      <BasicSettings title="User Account Details" />
    </div>
  );
};

export { AccountSettingsPlainContent };
