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

      <div className="font-airbnb flex grow flex-col lg:px-20">
        <Header />

        <main className="grow" role="content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </Fragment>
  );
};

export { Main };
