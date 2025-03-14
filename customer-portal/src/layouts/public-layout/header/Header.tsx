import { KeenIcon } from '@/components';

import clsx from 'clsx';
import { useState } from 'react';
import { HeaderLogo } from './HeaderLogo';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w- sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex flex-col  h-30 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <div className="flex justify-between px-4 pt-4 w-full ">
          <HeaderLogo />
          <div className="" />

          <div className="lg:flex hidden items-center gap-4">
            <Link to="/services">
              <span>Services</span>
            </Link>
            <Link to="/directory">
              <span className="">Directory</span>
            </Link>
          </div>
          <div className="" />
          <div className="" />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex  items-center gap-4 rounded-full border px-3 py-2 hover:shadow-md"
          >
            <KeenIcon icon="burger-menu-5" className="text-xl" />
            <KeenIcon icon="profile-circle" className="text-2xl text-gray-500" />
          </button>
        </div>

        {/* Search - Mobile */}
        <div className="flex lg:w-[55%] items-center gap-4 rounded-full border px-4 py-2 shadow-md hover:shadow-md transition duration-200 m-3 w-full">
          <div className="flex flex-col ml-4 w-full">
            <label className="form-label text-gray-900">Location</label>
            <label className="input bg-transparent h-3 leading-none p-0 m-0 border-none w-full">
              <input
                placeholder="Search Location"
                type="text"
                autoComplete="off"
                className={clsx('m-0 w-full b-0 bg-transparent')}
              />
            </label>
          </div>

          <div className="flex flex-col border-l px-5  border-gray-300 w-full">
            <label className="form-label text-gray-900">Age Group</label>
            <label className="input bg-transparent h-3 leading-none p-0 m-0 border-none w-full">
              <input
                placeholder="Search Age Group"
                type="text"
                autoComplete="off"
                className={clsx('m-0 w-full b-0 bg-transparent')}
              />
            </label>
          </div>
          <div className="flex items-center justify-center rounded-full bg-primary px-3 py-2 m-1">
            <KeenIcon icon="magnifier" className="text-xl font-bold text-white" />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute right-4 top-20 w-64 rounded-xl border bg-white shadow-lg">
          <div className="p-2">
            <button className="w-full rounded-lg px-4 py-3 text-left hover:bg-gray-100">
              Sign up
            </button>
            <button className="w-full rounded-lg px-4 py-3 text-left hover:bg-gray-100">
              Log in
            </button>
          </div>
          <div className="border-t p-2">
            <button className="w-full rounded-lg px-4 py-3 text-left hover:bg-gray-100">
              Airbnb your home
            </button>
            <button className="w-full rounded-lg px-4 py-3 text-left hover:bg-gray-100">
              Help Center
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export { Header };
