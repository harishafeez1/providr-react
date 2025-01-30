import { useAuthContext } from '@/auth';

const HeaderProfile = () => {
  const { currentUser } = useAuthContext();

  const render = () => {
    return (
      <div className="flex [.header_&]:below-lg:hidden items-center gap-1.25 text-xs lg:text-sm font-medium mb-2.5 lg:mb-0">
        {currentUser?.provider_company?.name || ''}
      </div>
    );
  };

  return render();
};

export { HeaderProfile };
