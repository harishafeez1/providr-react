import { KeenIcon } from '@/components';
import ReactSelect from 'react-select';
import { Navbar, NavbarActions } from '@/partials/navbar';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { HeaderLogo } from './HeaderLogo';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import GooglePlacesAutocomplete, {
  geocodeByAddress,
  geocodeByPlaceId,
  getLatLng
} from 'react-google-places-autocomplete';
import { store } from '@/redux/store';
import { setAgeGroup, setLocation } from '@/redux/slices/directory-slice';
import { useAppSelector } from '@/redux/hooks';
import { postDirectoryFilters } from '@/services/api/directory';
import {
  appendProviders,
  setAllProviders,
  setAllServices,
  setLoading,
  setPagination
} from '@/redux/slices/directory-listing-slice';
import { useAuthContext } from '@/auth';
import { PageMenu } from '@/pages/directory/blocks/PageMenu';
import { getAllServices } from '@/services/api/all-services';
import { FilterModal } from '@/pages/directory';

function ServicesSkeleton() {
  return (
    <div className="">
      <div className="animate-pulse">
        <div className="h-12 w-12 bg-gray-200 mb-2 rounded-full"></div>
        <div className="space-y-1">
          <div className="h-4 w-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

const Header = () => {
  const locationCheck = useLocation();
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);

  const { auth } = useAuthContext();

  const { allServices } = useAppSelector((state) => state.directoryListing);

  const { age_group } = useAppSelector((state) => state.directory);
  const {
    pagination: { loading }
  } = useAppSelector((state) => state.directoryListing);

  const handleLocationChange = async (address: any) => {
    const location: {
      latitude?: string;
      longitude?: string;
      address?: string;
      suburb?: string;
      state?: string;
      country?: string;
      zip_code?: string;
    } = {};

    if (address) {
      const results = await geocodeByPlaceId(address.value.place_id);
      const latLng = await getLatLng(results[0]);
      location.latitude = String(latLng.lat);
      location.longitude = String(latLng.lng);
      location.address = address.label;

      // Extract address components
      const addressComponents = results[0].address_components;

      // Extract suburb (usually stored as "locality" or "sublocality")
      const suburbComponent = addressComponents.find(
        (component) =>
          component.types.includes('locality') || component.types.includes('sublocality')
      );
      if (suburbComponent) {
        location.suburb = suburbComponent.long_name;
      }

      // Optionally, extract state, country, and postal code if needed:
      const stateComponent = addressComponents.find((component) =>
        component.types.includes('administrative_area_level_1')
      );
      if (stateComponent) {
        location.state = stateComponent.long_name;
      }
      const countryComponent = addressComponents.find((component) =>
        component.types.includes('country')
      );
      if (countryComponent) {
        location.country = countryComponent.long_name;
      }
      const zipComponent = addressComponents.find((component) =>
        component.types.includes('postal_code')
      );
      if (zipComponent) {
        location.zip_code = zipComponent.long_name;
      }

      store.dispatch(setLocation(location?.suburb));
    } else {
      store.dispatch(setLocation(''));
    }
  };

  const allFilters = useAppSelector((state) => state.directory);

  const handleFilters = async () => {
    if (!locationCheck.pathname.includes('directory')) {
      sessionStorage.setItem('fromService', 'true');
      navigate('/directory');
      return;
    }
    store.dispatch(setLoading(true));
    const res = await postDirectoryFilters(allFilters);
    if (res) {
      if (res.directories.current_page === 1) {
        store.dispatch(setAllProviders(res.directories.data));
      } else {
        store.dispatch(appendProviders(res.directories.data));
      }

      store.dispatch(
        setPagination({
          currentPage: res.directories.current_page,
          lastPage: res.directories.last_page
        })
      );
    }
    store.dispatch(setLoading(false));
  };

  const ageGroupOptions = [
    { value: 'Early Childhood (0-7 years)', label: 'Early Childhood (0-7 years)' },
    { value: 'Children (8-16 years)', label: 'Children (8-16 years)' },
    { value: 'Young people (17-21 years)', label: 'Young people (17-21 years)' },
    { value: 'Adults (22-59 years)', label: 'Adults (22-59 years)' },
    { value: 'Mature Age (60+ years)', label: 'Mature Age (60+ years)' }
  ];

  useEffect(() => {
    // Define and invoke the async function
    const fetchData = async () => {
      if (allServices.length <= 1) {
        try {
          setServicesLoading(true);

          const servicesRes = await getAllServices();
          if (servicesRes) {
            store.dispatch(setAllServices(servicesRes));
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setServicesLoading(false);
        }
      }
    };
    fetchData();
  }, []);

  const checkLoaction = useLocation();
  return (
    <header className="sticky top-[2px] z-50 bg-white shadow-[0px_-50px_50px_0px_#ffffff]">
      <div className="mx-auto flex flex-col h-30 items-center justify-between md:px-0 px-8 pb-2 relative">
        {/* Logo */}
        <div className="flex justify-between pt-4 w-full ">
          <HeaderLogo />
          <div className="" />

          <div className="lg:flex hidden items-center gap-4">
            <Link to="/services">
              <span
                className={clsx({
                  'py-2 font-semibold tracking-wider text-black/65':
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
                  'py-2 font-semibold tracking-wider text-black/65':
                    checkLoaction.pathname.includes('directory'),
                  'text-gray-600 font-medium hover:bg-gray-200 p-4 rounded-full hover:text-gray-700 tracking-wider':
                    !checkLoaction.pathname.includes('directory')
                })}
              >
                Directory
              </span>
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

        {/* Search */}

        <div className="relative flex md:w-[70%] xl:w-[49%] items-center gap-4 rounded-full border border-gray-300 px-2 py-2 shadow-default hover:shadow-md transition duration-200 m-3 w-full">
          <div className="flex flex-col gap-1 ps-4 w-full">
            <label className="form-label text-gray-900 ps-[0.6rem] font-semibold tracking-wide">
              Location
            </label>
            <label className="input bg-transparent leading-none p-0 m-0 border-none w-full h-4">
              <div className="w-full text-sm ">
                <div className="cursor-pointer">
                  <GooglePlacesAutocomplete
                    apiKey={import.meta.env.VITE_APP_GOOGLE_API_KEY}
                    autocompletionRequest={{
                      componentRestrictions: {
                        country: 'aus'
                      },
                      types: ['address']
                    }}
                    debounce={300}
                    selectProps={{
                      placeholder: 'Search location...',
                      styles: {
                        control: (provided) => ({
                          ...provided,
                          border: 'none', // Removes the border
                          boxShadow: 'none', // Removes the box shadow
                          backgroundColor: 'transparent',
                          height: '20px'
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
                          color: '#6a6a6a', // Change placeholder color if needed
                          display: 'block', // Default visible
                          letterSpacing: '0.3px',

                          // Hide placeholder on small screens
                          '@media (max-width: 425px)': {
                            display: 'none'
                          }
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
                        }),
                        clearIndicator: (provided) => ({
                          ...provided,
                          cursor: 'pointer'
                        })
                      },
                      onChange: handleLocationChange,
                      isClearable: true
                    }}
                  />
                </div>
              </div>
            </label>
          </div>

          <div className="flex flex-col border-l gap-1 px-5 border-gray-300 w-full">
            <label className="form-label text-gray-900 ps-[0.6rem] font-semibold tracking-wide">
              Age Group
            </label>
            <label className="input bg-transparent leading-none p-0 m-0 border-none w-full h-4">
              <div className="w-full text-sm ">
                <ReactSelect
                  options={ageGroupOptions}
                  value={ageGroupOptions.find((opt) => opt.value === age_group)}
                  onChange={(selectedOption) => {
                    if (selectedOption?.value) {
                      store.dispatch(setAgeGroup(selectedOption?.value));
                    } else {
                      store.dispatch(setAgeGroup(''));
                    }
                  }}
                  isClearable
                  placeholder={'Select Age Group'}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      border: 'none', // Removes the border
                      boxShadow: 'none', // Removes the box shadow
                      backgroundColor: 'transparent',
                      height: '20px'
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
                      color: '#6a6a6a', // Change placeholder color if needed
                      fontSize: '14px',
                      display: 'block', // Default visible
                      letterSpacing: '0.3px',

                      // Hide placeholder on small screens
                      '@media (max-width: 425px)': {
                        display: 'none'
                      }
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
                    }),
                    clearIndicator: (provided) => ({
                      ...provided,
                      cursor: 'pointer'
                    })
                  }}
                />
              </div>
            </label>
          </div>
          <button
            className="flex items-center justify-center rounded-full bg-primary px-3 py-2 m-1 cursor-pointer"
            onClick={handleFilters}
            // disabled={allFilters.age_group === '' && allFilters.location === ''}
          >
            <KeenIcon icon="magnifier" className="text-xl font-bold text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute right-4 top-20 w-64 rounded-xl border bg-white shadow-lg">
          <div className="flex flex-col p-2">
            <Link
              to={'/login'}
              className="w-full rounded-lg px-4 py-3 text-left hover:bg-gray-100 hover:text-primary font-medium"
            >
              Login as Participant
            </Link>
            <a
              href={`/provider-portal/auth/login`}
              className="w-full rounded-lg px-4 py-3 text-left hover:bg-gray-100 hover:text-primary font-medium"
              target="_blank"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login as Provider
            </a>
          </div>
        </div>
      )}

      <div className="border-b absolute left-0 right-0"></div>
      {locationCheck?.pathname?.includes('directory') && (
        <Navbar>
          <div className="flex w-full items-center justify-between pt-5">
            {servicesLoading ? (
              Array.from({ length: 20 }).map((_, index) => <ServicesSkeleton key={index} />)
            ) : (
              <PageMenu services={allServices} loading={servicesLoading} />
            )}
            <NavbarActions>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 rounded-xl border px-4 py-2 hover:shadow-md transition"
              >
                <KeenIcon icon="filter" className="w-5 h-5" />
                <span>Filters</span>
              </button>
              <FilterModal open={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
            </NavbarActions>
          </div>
        </Navbar>
      )}
    </header>
  );
};

export { Header };
