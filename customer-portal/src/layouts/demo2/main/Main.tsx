import { Fragment } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation } from 'react-router';
import { useMenuCurrentItem } from '@/components/menu';
import { useMenus } from '@/providers';
import { Header, Footer } from '../';
import { Toolbar, ToolbarHeading } from '../toolbar';

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
      <div className="flex grow flex-col [[data-sticky-header=on]_&]:pt-[--tw-header-height-default]">
        <Header />

        {/* <Navbar /> */}

        <main className="grow" role="content">
          {!pathname.includes('/public-profile/') && (
            <Toolbar>
              <ToolbarHeading />
            </Toolbar>
          )}
          <Outlet />
        </main>
        <Footer />
      </div>
    </Fragment>
  );
};

export { Main };
