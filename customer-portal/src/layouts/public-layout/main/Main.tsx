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
      <div className="max-w-full flex flex-col min-h-screen mx-auto">
        <div className=" flex grow flex-col px-10 xl:px-20 max-w-[2560px] mx-auto">
          <Header />
          <main className="grow" role="content">
            <Outlet />
          </main>
        </div>
        <div className="bg-[#eeeeee] min-w-full rounded-t-[52px] mt-auto">
          <Footer className="max-w-[2560px] mx-auto" />
        </div>
      </div>
    </Fragment>
  );
};

export { Main };
