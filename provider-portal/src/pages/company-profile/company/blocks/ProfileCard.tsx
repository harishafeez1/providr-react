import {
  KeenIcon,
  Menu,
  MenuItem,
  MenuToggle,
  MenuIcon,
  MenuLink,
  MenuSub,
  MenuTitle
} from '@/components';
import { toAbsoluteUrl } from '@/utils';

interface IProfileCardItem {
  image: string;
  title: string;
  description: string;
}

interface IProfileCardItems extends Array<IProfileCardItem> {}

const ProfileCard = () => {
  const ratings = 2;

  const DropdownCrudItem1 = () => {
    return (
      <MenuSub className="menu-default" rootClassName="w-full max-w-[175px]">
        <MenuItem path="#">
          <MenuLink>
            <MenuIcon>
              <KeenIcon icon="facebook" />
            </MenuIcon>
            <MenuTitle>facebook</MenuTitle>
          </MenuLink>
        </MenuItem>
        <MenuItem path="#">
          <MenuLink>
            <MenuIcon>
              <KeenIcon icon="twitter" />
            </MenuIcon>
            <MenuTitle>twitter</MenuTitle>
          </MenuLink>
        </MenuItem>
        <MenuItem path="#">
          <MenuLink>
            <MenuIcon>
              <KeenIcon icon="social-media" />
            </MenuIcon>
            <MenuTitle>linkedin</MenuTitle>
          </MenuLink>
        </MenuItem>
      </MenuSub>
    );
  };
  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Profile</h3>
        </div>
        <div className="card-body p-5 lg:p-7.5 lg:pb-7">
          <div className="card shadow-none w-full border-0 mb-4">
            <img
              src={toAbsoluteUrl(`/media/images/600x400/8.jpg`)}
              className="rounded-xl max-w-full shrink-0"
              alt=""
            />
          </div>
        </div>
        <div className="card-border card-rounded-b px-3.5 h-full pt-3 pb-3.5">
          <div className="flex items-center mt-2">
            <p className="text-2sm text-gray-700 m-1">Reviews</p>

            {[...Array(5)].map((_, index) => (
              <KeenIcon
                key={index}
                icon="star"
                className={index < ratings ? 'text-yellow-500 mr-1' : 'text-gray-400 mr-1'}
              />
            ))}
            <Menu>
              <MenuItem
                toggle="dropdown"
                trigger="click"
                dropdownProps={{
                  placement: 'bottom-end',
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: [0, 10] // [skid, distance]
                      }
                    }
                  ]
                }}
              >
                <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                  <KeenIcon icon="share" />
                </MenuToggle>
                {DropdownCrudItem1()}
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>
    </>
  );
};

export { ProfileCard, type IProfileCardItem, type IProfileCardItems };
