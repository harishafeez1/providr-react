import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/utils';

const HeaderLogo = () => {
  return (
    <>
      <div className="flex gap-1 lg:hidden items-center -ms-1">
        <Link to="/service-request" className="shrink-0">
          <img
            src={toAbsoluteUrl('/media/app/mini-logo2.png')}
            className="dark:hidden max-h-[32px]"
            alt="logo"
          />
        </Link>
      </div>
      <div className="gap-1 items-center -ms-1 hidden lg:flex">
        <Link to="/service-request" className="shrink-0">
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
