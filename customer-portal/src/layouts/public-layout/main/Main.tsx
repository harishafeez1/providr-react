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
      <div className="max-w-full">
        <div className=" flex grow flex-col px-10 lg:px-20 max-w-[2560px] mx-auto">
          <Header />
          <main className="grow" role="content">
            <Outlet />
          </main>
        </div>
        <Footer className="w-full" />
      </div>
    </Fragment>
  );
};

export { Main };
