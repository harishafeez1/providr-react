import { KeenIcon } from '@/components';
import {
  Menu,
  TMenuConfig,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuArrow
} from '@/components/menu';
import { useLanguage } from '@/i18n';
import { IServices } from '@/pages/directory/blocks/PageMenu';
import { useAppSelector } from '@/redux/hooks';
import {
  appendProviders,
  setAllProviders,
  setLoading,
  setLoadMore,
  setPagination
} from '@/redux/slices/directory-listing-slice';
import { setServiceId } from '@/redux/slices/directory-slice';
import { store } from '@/redux/store';
import { postDirectoryFilters } from '@/services/api/directory';
import React, { useEffect, useRef, useState } from 'react';
interface NavbarMenuProps {
  type: boolean;
  items: IServices[];
  loading: boolean;
}

const NavbarMenu: React.FC<NavbarMenuProps> = ({ type, items, loading }) => {
  const { isRTL } = useLanguage();
  const [selectedId, setSelectedId] = useState<number>();

  const allFilters = useAppSelector((state) => state.directory);
  const { service_id } = useAppSelector((state) => state.directory);
  const { isFilterModalOpen, loadMore } = useAppSelector((state) => state.directoryListing);

  const handlePostFilters = async () => {
    try {
      if (!isFilterModalOpen && service_id && !loadMore) {
        store.dispatch(setLoading(true));
        const res = await postDirectoryFilters(allFilters);
        if (res) {
          if (res?.directories?.current_page === 1) {
            store.dispatch(setAllProviders(res.directories.data));
          } else {
            store.dispatch(appendProviders(res.directories.data));
          }
          store.dispatch(
            setPagination({
              currentPage: res.directories.current_page,
              lastPage: res.directories.last_page
            })
          );
        }
      } else {
        store.dispatch(setLoadMore(false));
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      store.dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    handlePostFilters();
  }, [service_id]);

  const buildMenu = (services: TMenuConfig) => {
    return services.map((item) => {
      if (type) {
        return (
          <div
            key={item?.id}
            onClick={async () => {
              setSelectedId(item?.id);
              store.dispatch(setServiceId(item?.id));
            }}
          >
            <MenuItem
              className={`flex flex-col items-center gap-2 px-2 transition whitespace-nowrap cursor-pointer py-2 
              ${selectedId === item.id ? 'border-b-2 border-b-primary' : 'border-b-transparent'}`}
              toggle="dropdown"
              trigger="hover"
              dropdownProps={{
                placement: isRTL() ? 'bottom-end' : 'bottom-start',
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 0] // [skid, distance]
                    }
                  }
                ]
              }}
            >
              {item.service_icon ? (
                <div
                  className="h-6 w-6"
                  dangerouslySetInnerHTML={{ __html: item.service_icon }}
                ></div>
              ) : (
                ''
              )}
              <MenuTitle className="text-nowrap text-sm text-gray-700 menu-item-active:text-primary menu-item-active:font-medium menu-item-here:text-primary menu-item-here:font-medium menu-item-show:text-primary menu-link-hover:text-primary">
                {item.name || ''}
              </MenuTitle>
            </MenuItem>
          </div>
        );
      }
      // Other conditions or menu item variants can be handled here.
      return null;
    });
  };

  return (
    <>
      <div className="grid">
        <div className="scrollable-x-auto scrollbar-hidden">
          <Menu highlight={true} className="gap-3">
            {buildMenu(items)}
          </Menu>
        </div>
      </div>
    </>
  );
};

export { NavbarMenu };
