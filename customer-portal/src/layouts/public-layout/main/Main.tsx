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

  return (
    <Fragment>
      <Helmet>
        <title>{menuItem?.title}</title>
      </Helmet>
      <div className="flex flex-col min-h-screen w-full">
        <div className="flex-1 px-4 sm:px-6 md:px-10 xl:px-20 max-w-[2560px] mx-auto w-full">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
        <footer className="bg-[#eeeeee] w-full rounded-t-[52px] mt-auto">
          <div className="max-w-[2560px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20">
            <Footer className="" />
          </div>
        </footer>
      </div>
    </Fragment>
  );
};

export { Main };
