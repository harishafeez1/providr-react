import { KeenIcon } from '@/components';
import { Categories } from '@/pages/directory';

import clsx from 'clsx';
import { useState } from 'react';
import { HeaderLogo } from './HeaderLogo';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w- sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex flex-col lg:flex-row h-30 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <div className="flex flex-row justify-between px-4 w-full lg:w-auto">
          <HeaderLogo />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex md:flex lg:hidden items-center gap-4 rounded-full border px-3 py-2 hover:shadow-md"
          >
            <KeenIcon icon="burger-menu-5" className="text-xl" />
            <KeenIcon icon="profile-circle" className="text-2xl text-gray-500" />
          </button>
        </div>
        {/* Search - Desktop */}
        <div className="hidden md:flex items-center gap-4 rounded-full border px-4 py-2 shadow-md hover:shadow-md transition duration-200 m-3">
          <div className="flex flex-col ml-4">
            <label className="form-label text-gray-900">Location</label>
            <label className="input bg-transparent h-3 leading-none p-0 m-0 border-none ">
              <input
                placeholder="Search Location"
                type="text"
                autoComplete="off"
                className={clsx('m-0 b-0 bg-transparent')}
              />
            </label>
          </div>

          <div className="flex flex-col border-l px-3 border-gray-300">
            <label className="form-label text-gray-900">Age Group</label>
            <label className="input bg-transparent h-3 leading-none p-0 m-0 border-none ">
              <input
                placeholder="Search Age Group"
                type="text"
                autoComplete="off"
                className={clsx('m-0 b-0 bg-transparent')}
              />
            </label>
          </div>

          <div className="flex items-center justify-center rounded-full bg-primary px-4 py-2 m-1">
            <KeenIcon icon="magnifier" className="text-xl font-bold text-white" />
            <span className="ml-2 text-lg text-white">Search</span>
          </div>
        </div>

        {/* Search - Mobile */}
        <div className="flex md:hidden items-center gap-4 rounded-full border px-4 py-2 shadow-md hover:shadow-md transition duration-200 m-3 w-full">
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

          <div className="flex flex-col border-l border-gray-300 w-full">
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
          <div className="flex items-center justify-center rounded-full bg-primary px-4 py-2 m-1">
            <KeenIcon icon="magnifier" className="text-xl font-bold text-white" />
            <span className="ml-2 text-lg text-white">Search</span>
          </div>
        </div>

        {/* User Menu */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-4 rounded-full border px-3 py-2 hover:shadow-md"
          >
            <KeenIcon icon="burger-menu-5" className="text-xl" />
            <KeenIcon icon="profile-circle" className="text-2xl text-gray-500" />
          </button>
        </div>
      </div>
      <div className="hidden lg:flex w-full ">
        <Categories />
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
