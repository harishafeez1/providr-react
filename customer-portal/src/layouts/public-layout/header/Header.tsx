import { KeenIcon } from '@/components';
import ReactSelect from 'react-select';

import clsx from 'clsx';
import { useState } from 'react';
import { HeaderLogo } from './HeaderLogo';
import { Link } from 'react-router-dom';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { store } from '@/redux/store';
import { setAgeGroup, setLocation } from '@/redux/slices/directory-slice';
import { useAppSelector } from '@/redux/hooks';
import { postDirectoryFilters } from '@/services/api/directory';
import { getListoftProvider } from '@/services/api/provider-profile';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { age_group } = useAppSelector((state) => state.directory);

  const handleLocationChange = async (address: any) => {
    store.dispatch(setLocation(address.label));
  };

  const allFilters = useAppSelector((state) => state.directory);

  const handleFilters = async () => {
    const res = await postDirectoryFilters(allFilters);
    if (res) {
      await getListoftProvider(1);
    }
  };

  const ageGroupOptions = [
    { value: 'Early Childhood (0-7 years)', label: 'Early Childhood (0-7 years)' },
    { value: 'Children (8-16 years)', label: 'Children (8-16 years)' },
    { value: 'Young people (17-21 years)', label: 'Young people (17-21 years)' },
    { value: 'Adults (22-59 years)', label: 'Adults (22-59 years)' },
    { value: 'Mature Age (60+ years)', label: 'Mature Age (60+ years)' }
  ];

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
        <div className="relative flex lg:w-[55%] items-center gap-4 rounded-full border px-4 py-2 shadow-md hover:shadow-md transition duration-200 m-3 w-full">
          <div className="flex flex-col ml-4 w-full">
            <label className="form-label text-gray-900 ps-2">Location</label>
            <label className="input bg-transparent h-3 leading-none p-0 m-0 border-none w-full">
              <div className="w-full text-sm ">
                <div className="mt-2 cursor-pointer">
                  <GooglePlacesAutocomplete
                    apiKey={import.meta.env.VITE_APP_GOOGLE_API_KEY}
                    autocompletionRequest={{
                      componentRestrictions: {
                        country: 'aus'
                      }
                    }}
                    debounce={300}
                    selectProps={{
                      placeholder: 'Search location...',
                      styles: {
                        control: (provided) => ({
                          ...provided,
                          border: 'none', // Removes the border
                          boxShadow: 'none', // Removes the box shadow
                          backgroundColor: 'transparent' // Makes it transparent
                        }),
                        indicatorSeparator: () => ({ display: 'none' }), // Removes the dropdown arrow line
                        dropdownIndicator: (provided) => ({
                          ...provided,
                          display: 'none' // Hides the dropdown arrow
                        }),
                        input: (provided) => ({
                          ...provided,
                          color: '#000', // Text color
                          fontSize: '14px',
                          background: 'transparent'
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: '#999' // Change placeholder color if needed
                        }),
                        menu: (provided) => ({
                          ...provided,
                          background: 'white', // Background of the dropdown list
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          borderRadius: '8px',
                          border: 'none'
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          color: state.isFocused ? '#fff' : '#000', // Change text color on hover
                          backgroundColor: state.isFocused ? '#4a90e2' : 'transparent'
                        })
                      },
                      onChange: handleLocationChange
                      // isClearable: true
                    }}
                  />
                </div>
              </div>
            </label>
          </div>

          <div className="flex flex-col border-l px-5  border-gray-300 w-full">
            <label className="form-label text-gray-900 ps-2">Age Group</label>
            <label className="input bg-transparent h-3 leading-none p-0 m-0 border-none w-full mt-2">
              <div className="w-full text-sm ">
                <ReactSelect
                  options={ageGroupOptions}
                  value={ageGroupOptions.find((opt) => opt.value === age_group)}
                  onChange={(selectedOption) => store.dispatch(setAgeGroup(selectedOption?.value))}
                  // isClearable
                  placeholder="Select Age Group"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      border: 'none', // Removes the border
                      boxShadow: 'none', // Removes the box shadow
                      backgroundColor: 'transparent' // Makes it transparent
                    }),
                    indicatorSeparator: () => ({ display: 'none' }), // Removes the dropdown arrow line
                    dropdownIndicator: (provided) => ({
                      ...provided,
                      display: 'none' // Hides the dropdown arrow
                    }),
                    input: (provided) => ({
                      ...provided,
                      color: '#000', // Text color
                      fontSize: '14px',
                      background: 'transparent'
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: '#999', // Change placeholder color if needed
                      fontSize: '14px'
                    }),
                    menu: (provided) => ({
                      ...provided,
                      background: 'white', // Background of the dropdown list
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      border: 'none'
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      color: state.isFocused ? '#fff' : '#000', // Change text color on hover
                      backgroundColor: state.isFocused ? '#4a90e2' : 'transparent'
                    })
                  }}
                />
              </div>
            </label>
          </div>
          <div
            className="flex items-center justify-center rounded-full bg-primary px-3 py-2 m-1 cursor-pointer"
            onClick={handleFilters}
          >
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
