import { useRef } from 'react';
import { Menu, MenuItem, MenuToggle } from '@/components';
import { DropdownUser } from '@/partials/dropdowns/user';
import { useLanguage } from '@/i18n';
import { useAuthContext } from '@/auth';

import placeHolderImage from '../../../../public/media/avatars/blank.png';

const HeaderTopbar = () => {
  const itemUserRef = useRef<any>(null);
  const { isRTL } = useLanguage();
  const { currentUser, auth } = useAuthContext();
  const firstName = currentUser?.first_name;
  const firstLetter = firstName ? firstName.charAt(0).toUpperCase() : '';
  return (
    <div className="flex items-center gap-3.5">
      <Menu>
        <MenuItem
          ref={itemUserRef}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: isRTL() ? 'bottom-start' : 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [5, 10] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuToggle className="btn btn-icon rounded-full">
            {!auth && (
              <div className="w-10 h-10 rounded-full">
                <img src={placeHolderImage} alt="" className="rounded-full h-full w-full" />
              </div>
            )}
            {auth && firstLetter && (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-700">
                {firstLetter}
              </div>
            )}
          </MenuToggle>
          {DropdownUser({ menuItemRef: itemUserRef })}
        </MenuItem>
      </Menu>
    </div>
  );
};

export { HeaderTopbar };
