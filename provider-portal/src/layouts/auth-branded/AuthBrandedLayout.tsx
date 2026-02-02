import { Link, Outlet } from 'react-router-dom';
import { Fragment, useEffect, useState } from 'react';
import { toAbsoluteUrl } from '@/utils';
import useBodyClasses from '@/hooks/useBodyClasses';
import { AuthBrandedLayoutProvider } from './AuthBrandedLayoutProvider';

const DEFAULT_BG = toAbsoluteUrl('/media/images/Group.svg');

const Layout = () => {
  useBodyClasses('dark:bg-coal-500');

  const [bgImage, setBgImage] = useState(DEFAULT_BG);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_APP_API_URL;
    fetch(`${API_URL}/public/settings/branding`)
      .then((r) => r.json())
      .then((data) => {
        if (data.provider_login_background) {
          setBgImage(data.provider_login_background);
        }
      })
      .catch(() => {/* keep default */});
  }, []);

  return (
    <Fragment>
      <style>
        {`
          .branded-bg {
            background-image: url('${bgImage}');
          }
          .dark .branded-bg {
            background-image: url('${bgImage}');
          }
        `}
      </style>

      <div className="grid lg:grid-cols-2 grow min-h-screen">
        {/* Left side - form */}
        <div className="flex flex-col justify-center items-center p-8 lg:p-10">
          <div className="w-full max-w-[400px] mb-8">
            <Link to="/">
              <img
                src={toAbsoluteUrl('/media/app/logo2.png')}
                className="h-[40px] max-w-none"
                alt="Providr"
              />
            </Link>
          </div>
          <Outlet />
        </div>

        {/* Right side - cover image */}
        <div className="hidden lg:block lg:rounded-xl lg:border lg:border-gray-200 lg:m-5 bg-top xxl:bg-center xl:bg-cover bg-no-repeat branded-bg" />
      </div>
    </Fragment>
  );
};

// AuthBrandedLayout component that wraps the Layout component with AuthBrandedLayoutProvider
const AuthBrandedLayout = () => (
  <AuthBrandedLayoutProvider>
    <Layout />
  </AuthBrandedLayoutProvider>
);

export { AuthBrandedLayout };
