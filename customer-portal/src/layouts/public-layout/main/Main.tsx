import { Fragment } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation } from 'react-router';
import { useMenuCurrentItem } from '@/components/menu';
import { useMenus } from '@/providers';
import { Header, Footer } from '../';

const Main = () => {
  const { pathname } = useLocation();
  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig('primary');
  const menuItem = useMenuCurrentItem(pathname, menuConfig);

  const isProviderProfile = pathname.includes('provider-profile');

  return (
    <Fragment>
      <Helmet>
        <title>{menuItem?.title}</title>
      </Helmet>
      <div className="flex flex-col min-h-screen w-full">
        <div
          className={`flex-1 sm:px-6 md:px-8 xl:px-12 4xl:px-0 max-w-[1824px] mx-auto w-full ${isProviderProfile ? 'px-0' : 'px-4'}`}
        >
          <Header />
          <main className="grid grid-cols-12">
            <Outlet />
          </main>
        </div>
        <footer className="bg-[#eeeeee] w-full rounded-t-[52px] mt-auto">
          <div className="max-w-[2560px] mx-auto">
            <Footer className="hidden md:block" />
          </div>
        </footer>
      </div>
    </Fragment>
  );
};

export { Main };
