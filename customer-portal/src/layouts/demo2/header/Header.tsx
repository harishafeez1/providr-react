import clsx from 'clsx';
import { Container } from '@/components/container';
import { HeaderLogo, HeaderTopbar } from '.';
import { useDemo2Layout } from '../';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';

const Header = () => {
  const { headerSticky } = useDemo2Layout();
  // const checkLoaction = useLocation();

  useEffect(() => {
    if (headerSticky) {
      document.body.setAttribute('data-sticky-header', 'on');
    } else {
      document.body.removeAttribute('data-sticky-header');
    }
  }, [headerSticky]);

  return (
    <header
      className={clsx(
        'flex items-center transition-[height] shrink-0 bg-[--tw-page-bg] dark:bg-[--tw-page-bg-dark] h-[--tw-header-height]',
        headerSticky &&
          'transition-[height] fixed z-10 top-0 left-0 right-0 shadow-sm backdrop-blur-md bg-white/70 dark:bg-coal-500/70 dark:border-b dark:border-b-coal-100'
      )}
    >
      <Container className="flex justify-between items-center lg:gap-4">
        <HeaderLogo />
        {/* <div className="lg:flex hidden items-center gap-4 pe-14">
          <Link to="/services">
            <span
              className={clsx({
                'py-2 font-semibold tracking-wider text-black/80':
                  checkLoaction.pathname.includes('services'),
                'text-gray-600 font-medium hover:bg-gray-200 p-4 rounded-full hover:text-gray-700 tracking-wider':
                  !checkLoaction.pathname.includes('services')
              })}
            >
              Services
            </span>
          </Link>
          <Link to="/directory">
            <span
              className={clsx({
                'py-2 font-semibold tracking-wider text-black/80':
                  checkLoaction.pathname.includes('directory'),
                'text-gray-600 font-medium hover:bg-gray-200 p-4 rounded-full hover:text-gray-700 tracking-wider':
                  !checkLoaction.pathname.includes('directory')
              })}
            >
              Directory
            </span>
          </Link>
        </div> */}
        <HeaderTopbar />
      </Container>
    </header>
  );
};

export { Header };
