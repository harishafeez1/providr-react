import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/utils';

const HeaderLogo = () => {
  return (
    <div className="flex items-center gap-2 lg:gap-5 2xl:-ml-[60px]">
      <Link to="/" className="shrink-0">
        <img
          src={toAbsoluteUrl('/media/app/mini-logo2.png')}
          className="dark:hidden max-h-[32px]"
          alt="logo"
        />
        <img
          src={toAbsoluteUrl('/media/app/mini-logo2.png')}
          className="hidden dark:inline-block max-h-[32px]"
          alt="logo"
        />
      </Link>

      <div className="flex items-center">
        <h3 className="text-gray-700 text-base hidden md:block">Customer Portal</h3>
      </div>
    </div>
  );
};

export { HeaderLogo };
