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
import { setResetFilters, setServiceId } from '@/redux/slices/directory-slice';
import { store } from '@/redux/store';
import { postDirectoryFilters } from '@/services/api/directory';
import clsx from 'clsx';
import {
  ChevronLeft,
  ChevronRight,
  MenuIcon,
  SquareChevronLeft,
  SquareChevronRight
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
interface NavbarMenuProps {
  type: boolean;
  items: IServices[];
  loading: boolean;
}

const NavbarMenu: React.FC<NavbarMenuProps> = ({ type, items, loading }) => {
  const { isRTL } = useLanguage();
  const [selectedId, setSelectedId] = useState<number>();
  const [activeItem, setActiveItem] = useState('All');

  const allFilters = useAppSelector((state) => state.directory);
  const { service_id } = useAppSelector((state) => state.directory);
  const { isFilterModalOpen, loadMore } = useAppSelector((state) => state.directoryListing);

  const handleAllBtnFilter = async () => {
    store.dispatch(setResetFilters());
    try {
      const res = await postDirectoryFilters({ ...allFilters, service_id: '' });
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
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      store.dispatch(setLoading(false));
    }
  };

  const handlePostFilters = async () => {
    try {
      if (!isFilterModalOpen && service_id !== '' && !loadMore) {
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

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Scroll handler
  const scroll = (direction: any) => {
    const container = scrollRef.current as unknown as HTMLElement;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const newScrollPosition =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });

    // Update button states
    setTimeout(() => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
    }, 300);
  };

  const buildMenu = (services: TMenuConfig) => {
    return services.map((item) => {
      if (type) {
        return (
          <div
            // className="hover:border-b-2 border-gray-300"
            key={item?.id}
            onClick={async () => {
              setActiveItem('');
              setSelectedId(item?.id);
              store.dispatch(setServiceId(item?.id));
            }}
          >
            <MenuItem
              className={`flex flex-col items-center gap-2 px-2 transition whitespace-nowrap cursor-pointer py-2  
              ${selectedId === item.id && activeItem !== 'All' ? 'border-b-2 border-b-primary' : 'border-b-transparent'}`}
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
              <MenuTitle className="text-nowrap text-sm text-gray-700 menu-item-active:text-primary menu-item-active:font-medium menu-item-here:text-primary menu-item-here:font-medium menu-item-show:text-primary menu-link-hover:border-b ">
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
      <div className="grid relative">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className={`absolute -left-8 top-6 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-[20px_0px_30px_20px_#ffffff] border border-gray-400  cursor
          ${!canScrollLeft ? 'hidden' : 'hover:bg-gray-100'}`}
          disabled={!canScrollLeft}
        >
          <ChevronLeft size={15} />
        </button>

        {/* Scrollable Container */}
        <div ref={scrollRef} className="scrollable-x-auto scrollbar-hidden overflow-x-auto">
          <Menu highlight={true} className="gap-4 relative flex nowrap">
            {items?.length > 0 && (
              <div
                className="mt-[2px]"
                onClick={() => {
                  store.dispatch(setLoading(true));
                  setActiveItem('All'), handleAllBtnFilter();
                }}
              >
                <MenuItem className="flex flex-col items-center gap-3 pe-1 cursor-pointer">
                  <MenuIcon size={25} />
                  <MenuTitle
                    className={clsx('text-nowrap text-sm text-gray-700', {
                      'border-b-2 border-primary font-medium pb-2': activeItem === 'All'
                    })}
                  >
                    {'All'}
                  </MenuTitle>
                </MenuItem>
              </div>
            )}
            {buildMenu(items)}
          </Menu>
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className={`absolute -right-12 top-6 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-[-20px_0px_30px_20px_#ffffff] border border-gray-400 cursor
          ${!canScrollRight ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          disabled={!canScrollRight}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </>
  );
};

export { NavbarMenu };
