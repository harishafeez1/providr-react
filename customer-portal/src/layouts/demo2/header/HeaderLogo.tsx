import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/utils';

const HeaderLogo = () => {
  return (
    <div className="flex items-center gap-2 lg:gap-5 2xl:-ml-[60px]">
      <Link to="/service-request" className="shrink-0">
        <img
          src={toAbsoluteUrl('/media/app/logo2.png')}
          className="dark:hidden max-h-[32px]"
          alt="logo"
        />
      </Link>
    </div>
  );
};

export { HeaderLogo };
