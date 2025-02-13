import { BasicSettings, Password } from './blocks';

const AccountSettingsPlainContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5  mx-auto">
      <BasicSettings title="Settings - Participant details" />
      <Password />
    </div>
  );
};

export { AccountSettingsPlainContent };
