import { TMenuConfig, MenuSub } from '@/components/menu';
import { MegaMenuSubDropdown } from './components';

const MegaMenuSubBusiness = (items: TMenuConfig) => {
  const BusinessItem = items[4];

  return (
    <MenuSub className="menu-default py-2.5 lg:w-[225px]">
      {BusinessItem.children && MegaMenuSubDropdown(BusinessItem.children)}
    </MenuSub>
  );
};

export { MegaMenuSubBusiness };
