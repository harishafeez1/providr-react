import { KeenIcon } from '@/components';
import ReactSelect from 'react-select';
import { Navbar, NavbarActions } from '@/partials/navbar';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { HeaderLogo } from './HeaderLogo';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import GooglePlacesAutocomplete, {
  geocodeByAddress,
  geocodeByLatLng,
  geocodeByPlaceId,
  getLatLng
} from 'react-google-places-autocomplete';
import { store } from '@/redux/store';
import { setLocation, setServiceId, setCurrentLocation, setSearchServiceId } from '@/redux/slices/directory-slice';
import { useAppSelector } from '@/redux/hooks';
import { postDirectoryFilters } from '@/services/api/directory';
import {
  appendProviders,
  setAllProviders,
  setChangeSearchedServiceName,
  setIsSearchedFromHeader,
  setLoading,
  setPagination
} from '@/redux/slices/directory-listing-slice';
import { useAuthContext } from '@/auth';
import { PageMenu } from '@/pages/directory/blocks/PageMenu';
import { getAllServices, getAllServicesToTransform } from '@/services/api/all-services';
import { FilterModal } from '@/pages/directory';
import { Services } from '@/pages/company-profile';
import { useScroll, useTransform } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { HeaderTopbar } from './HeaderTopbar';
import { searchNearByProviders } from '@/services/api/search-providers';

function ServicesSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-12 w-12 bg-gray-200 mb-2 rounded-full"></div>
      <div className="space-y-1">
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

const Header = () => {
  const locationCheck = useLocation();
  const navigate = useNavigate();

  const { auth, logout } = useAuthContext();

  const { transformedServicesList } = useAppSelector((state) => state.services);

  const { service_id } = useAppSelector((state) => state.directory);
  const isSearchLoading = useAppSelector((state) => state.directoryListing.pagination.loading);

  useEffect(() => {
    const getServices = async () => {
      await getAllServicesToTransform('page=1&per_page=100');
    };

    getServices();
  }, []);

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
      const placeResults = await geocodeByPlaceId(address.value.place_id);
      const latLng = await getLatLng(placeResults[0]);
      const currentLoc = { latitude: latLng.lat, longitude: latLng.lng };
      setCurrentLocation(currentLoc);
      store.dispatch(setCurrentLocation(currentLoc)); // Store in Redux
      location.latitude = String(latLng.lat);
      location.longitude = String(latLng.lng);
      location.address = address.label;

      // Store suburb, state, etc. from suburb place data
      const suburbComponents = placeResults[0].address_components;
      const findComponent = (type: string) =>
        suburbComponents.find((component) => component.types.includes(type))?.long_name;

      location.suburb = findComponent('locality') || findComponent('sublocality');
      location.state = findComponent('administrative_area_level_1');
      location.country = findComponent('country');

      // ⬇️ Now reverse geocode lat/lng to get nearby street-level info
      const reverseResults = await geocodeByLatLng(latLng);
      const reverseComponents = reverseResults[0]?.address_components || [];

      const postalCode = reverseComponents.find((comp) =>
        comp.types.includes('postal_code')
      )?.long_name;

      location.zip_code = postalCode;

      console.log('Final Location:', location);
      store.dispatch(setLocation(location.suburb || ''));
    } else {
      // Clear both Redux location and default address when field is cleared
      store.dispatch(setLocation(''));
      setDefaultAddress(null);
    }
  };

  const allFilters = useAppSelector((state) => state.directory);
  const filtersToSend = {
    service_id: allFilters.service_id,
    location: allFilters.location,
    page: 1
  };

  // State to store current location coordinates
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Local state for header search service_id
  const [headerServiceId, setHeaderServiceId] = useState<string>('');

  const handleNewFilters = async () => {
    // Navigate to directory if not already there
    if (!locationCheck.pathname.includes('directory')) {
      navigate('/directory');
    }

    // Latitude and longitude are COMPULSORY for header search
    if (!currentLocation) {
      return; // Button should be disabled, so this shouldn't be reached
    }

    // Prepare data with REQUIRED location
    const data = {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude
    };

    // Add OPTIONAL service_id if it exists
    if (headerServiceId && headerServiceId !== '') {
      data.service_id = headerServiceId;
    }

    try {
      // Set loading state
      store.dispatch(setLoading(true));

      // Call the search API
      const response = await searchNearByProviders(data);

      // Store the service_id used for search (for pagination)
      store.dispatch(setSearchServiceId(headerServiceId || ''));

      if (response && response.data && response.data.length > 0) {
        // Set search results as providers
        store.dispatch(setAllProviders(response.data));
        store.dispatch(setIsSearchedFromHeader(true));

        // Set service name if searching by service
        if (headerServiceId && headerServiceId !== '') {
          const selectedService = transformedServicesList.find(
            (opt) => opt.value === headerServiceId
          );
          store.dispatch(setChangeSearchedServiceName(selectedService?.label || ''));
        }

        // Set pagination if available
        if (response.current_page && response.last_page) {
          store.dispatch(
            setPagination({
              currentPage: response.current_page,
              lastPage: response.last_page
            })
          );
        }
      } else {
        // No results found - show NoServicesFound component
        store.dispatch(setAllProviders([]));
        store.dispatch(setIsSearchedFromHeader(true));
        if (headerServiceId && headerServiceId !== '') {
          const selectedService = transformedServicesList.find(
            (opt) => opt.value === headerServiceId
          );
          store.dispatch(setChangeSearchedServiceName(selectedService?.label || ''));
        }
      }
    } catch (error) {
      console.error('Error searching nearby providers:', error);
      // On error, show NoServicesFound component
      store.dispatch(setAllProviders([]));
      store.dispatch(setIsSearchedFromHeader(true));
      if (headerServiceId && headerServiceId !== '') {
        const selectedService = transformedServicesList.find(
          (opt) => opt.value === headerServiceId
        );
        store.dispatch(setChangeSearchedServiceName(selectedService?.label || ''));
      }
    } finally {
      store.dispatch(setLoading(false));
    }
  };

  const handleFilters = async () => {
    if (!locationCheck.pathname.includes('directory')) {
      sessionStorage.setItem('fromService', 'true');
      navigate('/directory');
      return;
    }
    store.dispatch(setLoading(true));
    const res = await postDirectoryFilters(filtersToSend);
    if (res.directories?.data && res.directories.data.length > 0) {
      store.dispatch(setIsSearchedFromHeader(true));
      const selectedService = transformedServicesList.find((opt) => opt.value === service_id);
      store.dispatch(setChangeSearchedServiceName(selectedService?.label || ''));
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
    } else {
      store.dispatch(setIsSearchedFromHeader(true));
      const selectedService = transformedServicesList.find((opt) => opt.value === service_id);
      store.dispatch(setChangeSearchedServiceName(selectedService?.label || ''));
      store.dispatch(setAllProviders([]));
    }
    store.dispatch(setLoading(false));
  };

  const handleMobileSearch = async () => {
    await handleFilters();
    setIsMobileSearchOpen(false);
  };

  // useEffect(() => {
  //   // Define and invoke the async function
  //   const fetchData = async () => {
  //     if (allServices.length <= 1) {
  //       try {
  //         setServicesLoading(true);

  //         const servicesRes = await getAllServices(`page=${}`);
  //         if (servicesRes) {
  //           store.dispatch(setAllServices(servicesRes));
  //         }
  //       } catch (error) {
  //         console.error('Error fetching data:', error);
  //       } finally {
  //         setServicesLoading(false);
  //       }
  //     }
  //   };
  //   fetchData();
  // }, []);

  const [defaultAddress, setDefaultAddress] = useState<{ label: string; value: string } | null>(
    null
  );
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const currentLoc = { latitude, longitude };
          setCurrentLocation(currentLoc);
          store.dispatch(setCurrentLocation(currentLoc)); // Store in Redux
          // Step 2: Reverse geocode to get Australian address
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_APP_GOOGLE_API_KEY}`
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              // Find address component with suburb (locality) and format address
              const addressComponents = data.results[0].address_components;
              let suburb = '';
              let state = '';
              let postcode = '';
              let country = '';

              addressComponents.forEach((component: any) => {
                if (component.types.includes('locality')) {
                  suburb = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                  state = component.short_name;
                }
                if (component.types.includes('postal_code')) {
                  postcode = component.long_name;
                }
                if (component.types.includes('country')) {
                  country = component.long_name;
                }
              });

              store.dispatch(setLocation(suburb));

              // Format address starting with suburb
              const formattedAddress = `${suburb}, ${state} ${postcode}, ${country}`;
              setDefaultAddress({
                label: formattedAddress,
                value: formattedAddress
              });
            }
          } catch (error) {
            console.error('Error reverse geocoding:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error.message);
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }, []);

  const checkLoaction = useLocation();

  return (
    <header
      className={`${checkLoaction.pathname.includes('provider-profile') ? 'hidden md:block' : ''} sticky top-[2px] z-50 bg-white shadow-[0px_-50px_50px_0px_#ffffff] font-montserrat`}
    >
      <div className="mx-auto flex flex-col h-30 items-center justify-between md:px-0 px-8 pb-2 relative">
        {/* Logo */}
        <div className="flex justify-between pt-4 w-full ">
          <HeaderLogo />
          <div className="" />

          <div className="lg:flex hidden items-center gap-4">
            <Link to="/services">
              <span
                className={clsx({
                  'py-2 font-semibold tracking-wider text-black/80':
                    checkLoaction.pathname.includes('services'),
                  'text-gray-500 font-semibold hover:bg-gray-200 p-4 rounded-full hover:text-gray-700 tracking-wider':
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
                  'text-gray-500 font-semibold hover:bg-gray-200 p-4 rounded-full hover:text-gray-700 tracking-wider':
                    !checkLoaction.pathname.includes('directory')
                })}
              >
                Directory
              </span>
            </Link>
          </div>
          <div className="" />
          <div className="" />
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-4 rounded-full border px-3 py-2 hover:shadow-md cursor-pointer">
                {auth ? (
                  <div className="font-semibold ">
                    {`${auth?.customer?.first_name || ''} ${auth?.customer?.last_name || ''}`}
                  </div>
                ) : (
                  <KeenIcon icon="burger-menu-5" className="text-xl" />
                )}
                <KeenIcon icon="profile-circle" className="text-2xl text-gray-500" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end">
              {!auth && (
                <DropdownMenuItem>
                  <Link
                    to={'/login'}
                    className="flex flex-col ps-2 items-start group cursor-pointer gap-0"
                  >
                    <span className="text-lg font-semibold group-hover:text-primary">
                      I am an NDIS participant
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Find supports, track service requests, and connect with providers.
                    </span>
                  </Link>
                </DropdownMenuItem>
              )}
              {auth && (
                <>
                  <Link
                    to={'/service-request'}
                    className="flex flex-col items-start gap-0 w-full group"
                  >
                    <DropdownMenuItem className="w-full cursor-pointer group-hover:text-primary">
                      <span className="text-lg font-semibold group-hover:text-primary">
                        My Service Requests
                      </span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Link to="/wishlist" className="flex flex-col items-start gap-0 w-full group">
                    <DropdownMenuItem className="w-full cursor-pointer group-hover:text-primary">
                      <span className="text-lg font-semibold ">My Wishlist</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    className="w-full cursor-pointer group-hover:text-primary"
                    onClick={logout}
                  >
                    <span className="text-lg font-semibold group-hover:text-primary">Log Out</span>
                  </DropdownMenuItem>
                </>
              )}
              {!auth && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="">
                    <a
                      href={`/provider-portal/auth/login`}
                      target="_blank"
                      className="flex flex-col ps-2 items-start group cursor-pointer gap-0"
                    >
                      <span className="text-lg font-semibold group-hover:text-primary">
                        I am a Provider
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Manage your listings, respond to enquiries, and grow your services.
                      </span>
                    </a>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu> */}

          {/* Mobile Search Icon */}

          <div className="flex gap-4">
            <div className="md:hidden flex items-center">
              <Dialog open={isMobileSearchOpen} onOpenChange={setIsMobileSearchOpen}>
                <DialogTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <KeenIcon icon="magnifier" className="text-2xl text-gray-600" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] min-h-[60vh] p-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-center">
                      Search Services
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    {/* Location Search */}
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-gray-900">Where</label>
                      <div className="relative rounded-lg border border-gray-300 px-4 py-3 hover:border-gray-400 focus-within:border-primary transition-colors">
                        <GooglePlacesAutocomplete
                          key={defaultAddress?.label || 'no-address-mobile'}
                          apiKey={import.meta.env.VITE_APP_GOOGLE_API_KEY}
                          autocompletionRequest={{
                            componentRestrictions: {
                              country: 'au'
                            },
                            types: ['(regions)']
                          }}
                          apiOptions={{
                            region: 'AU'
                          }}
                          selectProps={{
                            defaultValue: defaultAddress,
                            placeholder: 'Search destinations...',
                            styles: {
                              control: (provided) => ({
                                ...provided,
                                border: 'none',
                                boxShadow: 'none',
                                backgroundColor: 'transparent',
                                minHeight: 'auto'
                              }),
                              valueContainer: (provided) => ({
                                ...provided,
                                padding: '0'
                              }),
                              indicatorSeparator: () => ({ display: 'none' }),
                              dropdownIndicator: (provided) => ({
                                ...provided,
                                display: 'none'
                              }),
                              input: (provided) => ({
                                ...provided,
                                color: '#000',
                                fontSize: '14px',
                                margin: '0',
                                padding: '0'
                              }),
                              placeholder: (provided) => ({
                                ...provided,
                                color: '#6b7280',
                                fontSize: '14px',
                                margin: '0'
                              }),
                              singleValue: (provided) => ({
                                ...provided,
                                color: '#000',
                                fontSize: '14px',
                                margin: '0'
                              }),
                              menu: (provided) => ({
                                ...provided,
                                backgroundColor: 'white',
                                boxShadow:
                                  '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                borderRadius: '0.5rem',
                                border: '1px solid #e5e7eb',
                                zIndex: 50
                              }),
                              option: (provided, state) => ({
                                ...provided,
                                color: state.isFocused ? '#fff' : '#111827',
                                backgroundColor: state.isFocused ? '#4a90e2' : 'transparent',
                                padding: '0.75rem 1rem',
                                cursor: 'pointer'
                              }),
                              clearIndicator: (provided) => ({
                                ...provided,
                                color: '#6b7280',
                                cursor: 'pointer',
                                ':hover': {
                                  color: '#374151'
                                }
                              })
                            },
                            onChange: handleLocationChange,
                            isClearable: true
                          }}
                        />
                      </div>
                    </div>

                    {/* Service Type Search */}
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-gray-900">Type of Service</label>
                      <div className="relative rounded-lg border border-gray-300 px-4 py-3 hover:border-gray-400 focus-within:border-primary transition-colors">
                        <ReactSelect
                          options={transformedServicesList}
                          value={transformedServicesList.find((opt) => opt.value === headerServiceId)}
                          onChange={(selectedOption) => {
                            if (selectedOption?.value) {
                              setHeaderServiceId(selectedOption?.value);
                            } else {
                              setHeaderServiceId('');
                            }
                          }}
                          isClearable
                          placeholder="Select Service"
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              border: 'none',
                              boxShadow: 'none',
                              backgroundColor: 'transparent',
                              minHeight: 'auto'
                            }),
                            valueContainer: (provided) => ({
                              ...provided,
                              padding: '0'
                            }),
                            indicatorSeparator: () => ({ display: 'none' }),
                            dropdownIndicator: (provided) => ({
                              ...provided,
                              display: 'none'
                            }),
                            input: (provided) => ({
                              ...provided,
                              color: '#000',
                              fontSize: '14px',
                              margin: '0',
                              padding: '0'
                            }),
                            placeholder: (provided) => ({
                              ...provided,
                              color: '#6b7280',
                              fontSize: '14px',
                              margin: '0'
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              color: '#000',
                              fontSize: '14px',
                              margin: '0'
                            }),
                            menu: (provided) => ({
                              ...provided,
                              backgroundColor: 'white',
                              boxShadow:
                                '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                              borderRadius: '0.5rem',
                              border: '1px solid #e5e7eb',
                              zIndex: 50
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              color: state.isFocused ? '#fff' : '#111827',
                              backgroundColor: state.isFocused ? '#4a90e2' : 'transparent',
                              padding: '0.75rem 1rem',
                              cursor: 'pointer'
                            }),
                            clearIndicator: (provided) => ({
                              ...provided,
                              color: '#6b7280',
                              cursor: 'pointer',
                              ':hover': {
                                color: '#374151'
                              }
                            })
                          }}
                        />
                      </div>
                    </div>

                    {/* Search Button */}
                    <button
                      className={`w-full inline-flex items-center justify-center rounded-lg px-6 py-4 text-lg font-semibold text-white shadow-lg transition-colors min-h-[56px] ${
                        isSearchLoading || !currentLocation
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-primary hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                      }`}
                      onClick={handleMobileSearch}
                      disabled={isSearchLoading || !currentLocation}
                    >
                      {isSearchLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Searching...
                        </>
                      ) : (
                        <>
                          <KeenIcon icon="magnifier" className="text-base mr-2" />
                          Search
                        </>
                      )}
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <HeaderTopbar />
          </div>
        </div>

        {/* Search */}

        <div className="hidden relative md:flex w-[60%] md:w-[70%] xl:w-[49%] items-center gap-4 rounded-full border border-gray-300 px-2 py-2 shadow-default hover:shadow-md transition duration-200 m-3">
          <div className="flex flex-col gap-1 ps-4 w-full">
            <label className="form-label text-gray-900 ps-[0.6rem] font-semibold tracking-wide">
              Where
            </label>
            <label className="input bg-transparent leading-none p-0 m-0 border-none w-full h-4">
              <div className="w-full text-sm ">
                <div className="cursor-pointer">
                  <GooglePlacesAutocomplete
                    key={defaultAddress?.label || 'no-address'}
                    apiKey={import.meta.env.VITE_APP_GOOGLE_API_KEY}
                    autocompletionRequest={{
                      // location: userLocation ?? undefined,
                      // radius: 20000,
                      componentRestrictions: {
                        country: 'au'
                      },
                      types: ['(regions)']
                    }}
                    apiOptions={{
                      region: 'AU'
                    }}
                    selectProps={{
                      defaultValue: defaultAddress,
                      placeholder: 'Search destinations...',
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
                          '@media (max-width: 550px)': {
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
              Type of Service
            </label>
            <label className="input bg-transparent leading-none p-0 m-0 border-none w-full h-4">
              <div className="w-full text-sm ">
                <ReactSelect
                  options={transformedServicesList}
                  value={transformedServicesList.find((opt) => opt.value === headerServiceId)}
                  onChange={(selectedOption) => {
                    if (selectedOption?.value) {
                      setHeaderServiceId(selectedOption?.value);
                    } else {
                      setHeaderServiceId('');
                    }
                  }}
                  isClearable
                  placeholder={'Add Service'}
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
                      '@media (max-width: 550px)': {
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
            className={`flex items-center justify-center rounded-full px-3 py-2 m-1 ${
              isSearchLoading || !currentLocation ? 'bg-[#7b4f84] cursor-not-allowed' : 'bg-primary cursor-pointer'
            }`}
            // onClick={handleFilters}
            onClick={handleNewFilters}
            disabled={isSearchLoading || !currentLocation}
          >
            <KeenIcon icon="magnifier" className="text-xl font-bold text-white" />
          </button>
        </div>
      </div>

      {/* {locationCheck?.pathname?.includes('directory') && (
        <Navbar>
          <div className="flex w-full items-center justify-between pt-5">
            <PageMenu services={allServices} loading={servicesLoading} />

            {!servicesLoading && (
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
            )}
          </div>
        </Navbar>
      )} */}
    </header>
  );
};

export { Header };
