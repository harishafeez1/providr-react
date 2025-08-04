import { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { useAuthContext } from '@/auth';

import { KeenIcon } from '@/components';
import { MenuItem, MenuLink, MenuSub, MenuTitle, MenuIcon } from '@/components/menu';

interface IDropdownUserProps {
  menuItemRef: any;
}

const DropdownUser = ({ menuItemRef }: IDropdownUserProps) => {
  const { logout, auth } = useAuthContext();

  const buildMenu = () => {
    return (
      <Fragment>
        {auth ? (
          <div className="flex flex-col">
            <MenuItem>
              <MenuLink path="/settings">
                <MenuIcon className="setting-2">
                  <KeenIcon icon="setting-2" />
                </MenuIcon>
                <MenuTitle>Settings</MenuTitle>
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink path="/service-request">
                <MenuIcon className="setting-2">
                  <KeenIcon icon="courier" />
                </MenuIcon>
                <MenuTitle>Service Requests</MenuTitle>
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink path="/documents">
                <MenuIcon className="setting-2">
                  <KeenIcon icon="note-2" />
                </MenuIcon>
                <MenuTitle>Documents</MenuTitle>
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink path="/reviews">
                <MenuIcon className="setting-2">
                  <KeenIcon icon="pencil" />
                </MenuIcon>
                <MenuTitle>My Reviews</MenuTitle>
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink path="/wishlist">
                <MenuIcon className="setting-2">
                  <KeenIcon icon="heart" />
                </MenuIcon>
                <MenuTitle>My Wishlist</MenuTitle>
              </MenuLink>
            </MenuItem>
          </div>
        ) : (
          <div className="font-montserrat">
            <MenuItem>
              <MenuLink path={'/login'}>
                <MenuIcon className="setting-2">
                  <KeenIcon icon="badge" />
                </MenuIcon>
                <MenuTitle>I am an NDIS participant</MenuTitle>
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink externalLink newTab path={`/provider-portal/auth/login`}>
                <MenuIcon className="setting-2">
                  <KeenIcon icon="security-user" />
                </MenuIcon>
                <MenuTitle>I am a Provider</MenuTitle>
              </MenuLink>
            </MenuItem>
          </div>
        )}
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
      {auth && buildFooter()}
    </MenuSub>
  );
};

export { DropdownUser };
