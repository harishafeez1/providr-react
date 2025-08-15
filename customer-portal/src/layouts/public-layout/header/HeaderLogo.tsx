import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/utils';
import { postDirectoryFilters } from '@/services/api/directory';
import { store } from '@/redux/store';
import {
  setAllProviders,
  setIsSearchedFromHeader,
  setPagination
} from '@/redux/slices/directory-listing-slice';

const HeaderLogo = () => {
  const handleLogoClick = async () => {
    try {
      const payload = {
        location: "",
        page: 1,
        service_id: ""
      };
      
      const res = await postDirectoryFilters(payload);
      
      if (res.directories?.data) {
        store.dispatch(setAllProviders(res.directories.data));
        store.dispatch(
          setPagination({
            currentPage: res.directories.current_page,
            lastPage: res.directories.last_page
          })
        );
        store.dispatch(setIsSearchedFromHeader(false));
      }
      
      console.log('Directory API called from logo click:', res);
    } catch (error) {
      console.error('Error calling directory API from logo:', error);
    }
  };

  return (
    <>
      <div className="flex gap-1 lg:hidden items-center -ms-1">
        <Link to="/directory" className="shrink-0" onClick={handleLogoClick}>
          <img
            src={toAbsoluteUrl('/media/app/mini-logo2.png')}
            className="dark:hidden max-h-[32px]"
            alt="logo"
          />
        </Link>
      </div>
      <div className="gap-1 items-center -ms-1 hidden lg:flex">
        <Link to="/directory" className="shrink-0" onClick={handleLogoClick}>
          <img
            src={toAbsoluteUrl('/media/app/logo2.png')}
            className="dark:hidden max-h-[32px]"
            alt="logo"
          />
        </Link>
      </div>
    </>
  );
};

export { HeaderLogo };
