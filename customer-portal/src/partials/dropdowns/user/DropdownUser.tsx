import { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { useAuthContext } from '@/auth';

import { KeenIcon } from '@/components';
import { MenuItem, MenuLink, MenuSub, MenuTitle, MenuIcon } from '@/components/menu';

interface IDropdownUserProps {
  menuItemRef: any;
}

const DropdownUser = ({ menuItemRef }: IDropdownUserProps) => {
  const { logout } = useAuthContext();

  const buildMenu = () => {
    return (
      <Fragment>
        <div className="flex flex-col">
          <MenuItem>
            <MenuLink path="/public-profile/profiles/default">
              <MenuIcon className="setting-2">
                <KeenIcon icon="badge" />
              </MenuIcon>
              <MenuTitle>Settings</MenuTitle>
            </MenuLink>
          </MenuItem>
        </div>
      </Fragment>
    );
  };

  const buildFooter = () => {
    return (
      <div className="flex flex-col">
        <div className="menu-item px-4 py-1.5">
          <a onClick={logout} className="btn btn-sm btn-light justify-center">
            <FormattedMessage id="USER.MENU.LOGOUT" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <MenuSub
      className="menu-default light:border-gray-300 w-[200px] md:w-[250px]"
      rootClassName="p-0"
    >
      {buildMenu()}
      {buildFooter()}
    </MenuSub>
  );
};

export { DropdownUser };
