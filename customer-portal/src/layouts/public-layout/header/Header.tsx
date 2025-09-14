import { KeenIcon } from '@/components';
import ReactSelect from 'react-select';

import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { HeaderLogo } from './HeaderLogo';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import GooglePlacesAutocomplete, {
  geocodeByLatLng,
  geocodeByPlaceId,
  getLatLng
} from 'react-google-places-autocomplete';
import { store } from '@/redux/store';
import {
  setLocation,
  setServiceId,
  setCurrentLocation,
  setSearchServiceId
} from '@/redux/slices/directory-slice';
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
import { getAllServicesToTransform } from '@/services/api/all-services';

import { HeaderTopbar } from './HeaderTopbar';
import { searchNearByProviders } from '@/services/api/search-providers';

interface HeaderSearchI {
  latitude?: number;
  longitude?: number;
  service_id?: string | null;
}

const Header = () => {
  const locationCheck = useLocation();
  const navigate = useNavigate();

  const { transformedServicesList } = useAppSelector((state) => state.services);

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
      setHeaderCurrentLocation(currentLoc);
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
      store.dispatch(setLocation(location.suburb || ''));

      // Set the defaultAddress so the GooglePlacesAutocomplete shows the selected value
      setDefaultAddress({
        label: address.label,
        value: address.label
      });
    } else {
      // Clear all location-related state when field is cleared
      store.dispatch(setLocation(''));
      setDefaultAddress(null);
      setHeaderCurrentLocation(null); // Clear coordinates state
      store.dispatch(setCurrentLocation(null)); // Clear Redux coordinates completely
    }
  };

  // State to store current location coordinates
  const [headerCurrentLocation, setHeaderCurrentLocation] = useState<{
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

    // Check if at least one input has a value (button should be disabled otherwise)
    if (!isSearchEnabled) {
      return; // Button should be disabled, so this shouldn't be reached
    }

    // Prepare data - location is now optional
    const data: HeaderSearchI = {};

    // Add location if available - check both local state and Redux state
    const reduxCurrentLocation = store.getState().directory.currentLocation;

    if (headerCurrentLocation && reduxCurrentLocation) {
      data.latitude = headerCurrentLocation.latitude;
      data.longitude = headerCurrentLocation.longitude;
    }

    // Add service_id if available (handle both string and number)
    if (
      headerServiceId &&
      ((typeof headerServiceId === 'string' && headerServiceId !== '') ||
        (typeof headerServiceId === 'number' && headerServiceId > 0))
    ) {
      data.service_id = headerServiceId.toString();
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

        // Set service name based on service_id selection
        if (
          headerServiceId &&
          ((typeof headerServiceId === 'string' && headerServiceId !== '') ||
            (typeof headerServiceId === 'number' && headerServiceId > 0))
        ) {
          // Use service name from API response data
          const serviceName = response.data[0]?.service?.name || '';
          store.dispatch(setChangeSearchedServiceName(serviceName));
        } else {
          // No service selected, set empty string
          store.dispatch(setChangeSearchedServiceName(''));
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
        if (
          headerServiceId &&
          ((typeof headerServiceId === 'string' && headerServiceId !== '') ||
            (typeof headerServiceId === 'number' && headerServiceId > 0))
        ) {
          // Use service name from transformedServicesList as fallback when no data
          const selectedService = transformedServicesList.find(
            (opt) => opt.value === headerServiceId
          );
          store.dispatch(setChangeSearchedServiceName(selectedService?.label || ''));
        } else {
          // No service selected, set empty string
          store.dispatch(setChangeSearchedServiceName(''));
        }
      }
    } catch (error) {
      console.error('Error searching nearby providers:', error);
      // On error, show NoServicesFound component
      store.dispatch(setAllProviders([]));
      store.dispatch(setIsSearchedFromHeader(true));
      if (
        headerServiceId &&
        ((typeof headerServiceId === 'string' && headerServiceId !== '') ||
          (typeof headerServiceId === 'number' && headerServiceId > 0))
      ) {
        const selectedService = transformedServicesList.find(
          (opt) => opt.value === headerServiceId
        );
        store.dispatch(setChangeSearchedServiceName(selectedService?.label || ''));
      } else {
        // No service selected, set empty string
        store.dispatch(setChangeSearchedServiceName(''));
      }
    } finally {
      store.dispatch(setLoading(false));
    }
  };

  const handleMobileSearch = async () => {
    await handleNewFilters();
    setIsMobileSearchOpen(false);
  };

  const [defaultAddress, setDefaultAddress] = useState<{ label: string; value: string } | null>(
    null
  );
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Check if search should be enabled based on actual input values
  const isSearchEnabled = React.useMemo(() => {
    // Check if location has a value (defaultAddress exists and has meaningful content)
    const hasLocation =
      defaultAddress &&
      defaultAddress.label &&
      defaultAddress.label.trim() !== '' &&
      headerCurrentLocation;

    // Check if service has a value (headerServiceId exists and is not empty)
    // Handle both string and number values from the service dropdown
    const hasService =
      headerServiceId &&
      ((typeof headerServiceId === 'string' && headerServiceId.trim() !== '') ||
        (typeof headerServiceId === 'number' && headerServiceId > 0));

    // Enable search if either location OR service has a value (not both required)
    // Button should only be disabled when BOTH are empty
    const enabled = (hasLocation || hasService) && !isSearchLoading;

    return enabled;
  }, [defaultAddress, headerCurrentLocation, headerServiceId, isSearchLoading]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const currentLoc = { latitude, longitude };
          setHeaderCurrentLocation(currentLoc);
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

          {/* Mobile Search Icon */}

          <div className="flex gap-4">
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <KeenIcon icon="magnifier" className="text-2xl text-gray-600" />
              </button>

              {/* Custom Modal */}
              {isMobileSearchOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                  {/* Backdrop */}
                  <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setIsMobileSearchOpen(false)}
                  />

                  {/* Modal Content */}
                  <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto overflow-visible">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                      <h2 className="text-xl font-semibold">Search Services</h2>
                      <button
                        onClick={() => setIsMobileSearchOpen(false)}
                        className="hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <KeenIcon icon="cross" className="p-2" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4 flex flex-col gap-4 min-h-[80vh] overflow-y-auto">
                      {/* Location Search */}
                      <div className="">
                        <label className="text-sm font-semibold text-gray-900">Where</label>
                        <div className="">
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
                                control: (provided, state) => ({
                                  ...provided,
                                  borderColor: '#762c85',
                                  boxShadow: state.isFocused
                                    ? '0 0 0 1px #762c85'
                                    : provided.boxShadow,
                                  '&:hover': {
                                    borderColor: '#762c85'
                                  }
                                }),
                                option: (provided, state) => ({
                                  ...provided,
                                  backgroundColor: state.isSelected
                                    ? '#752C84'
                                    : state.isFocused
                                      ? '#faf5ff'
                                      : 'transparent',
                                  color: state.isSelected
                                    ? '#ffffff'
                                    : state.isFocused
                                      ? '#752C84'
                                      : '#111827',
                                  '&:hover': {
                                    backgroundColor: state.isSelected ? '#752C84' : '#faf5ff',
                                    color: state.isSelected ? '#ffffff' : '#752C84'
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
                      <div className="">
                        <label className="text-sm font-semibold text-gray-900">
                          Type of Service
                        </label>
                        <div className="">
                          <ReactSelect
                            options={transformedServicesList}
                            value={transformedServicesList.find(
                              (opt) => opt.value === headerServiceId
                            )}
                            onChange={(selectedOption) => {
                              if (selectedOption?.value) {
                                setHeaderServiceId(selectedOption?.value);
                              } else {
                                setHeaderServiceId('');
                                store.dispatch(setServiceId(''));
                              }
                            }}
                            isClearable
                            placeholder="Select Service"
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                borderColor: '#762c85',
                                boxShadow: state.isFocused
                                  ? '0 0 0 1px #762c85'
                                  : provided.boxShadow,
                                '&:hover': {
                                  borderColor: '#762c85'
                                }
                              }),
                              menu: (provided) => ({
                                ...provided,
                                zIndex: 1000,
                                position: 'absolute'
                              }),
                              menuList: (provided) => ({
                                ...provided,
                                maxHeight: '200px',
                                overflowY: 'auto'
                              }),
                              option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isSelected
                                  ? '#752C84'
                                  : state.isFocused
                                    ? '#faf5ff'
                                    : 'transparent',
                                color: state.isSelected
                                  ? '#ffffff'
                                  : state.isFocused
                                    ? '#752C84'
                                    : '#111827',
                                '&:hover': {
                                  backgroundColor: state.isSelected ? '#752C84' : '#faf5ff',
                                  color: state.isSelected ? '#ffffff' : '#752C84'
                                }
                              })
                            }}
                          />
                        </div>
                      </div>

                      {/* Search Button */}
                      <button
                        className={`mt-auto mb-5 w-full inline-flex items-center justify-center rounded-lg px-6 py-4 text-lg font-semibold text-white shadow-lg transition-colors ${
                          !isSearchEnabled
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                        }`}
                        onClick={handleMobileSearch}
                        disabled={!isSearchEnabled}
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
                  </div>
                </div>
              )}
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
                          backgroundColor: state.isSelected
                            ? '#752C84'
                            : state.isFocused
                              ? '#faf5ff'
                              : 'transparent',
                          color: state.isSelected
                            ? '#ffffff'
                            : state.isFocused
                              ? '#752C84'
                              : '#111827',
                          '&:hover': {
                            backgroundColor: state.isSelected ? '#752C84' : '#faf5ff',
                            color: state.isSelected ? '#ffffff' : '#752C84'
                          }
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
                      store.dispatch(setServiceId(''));
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
                      backgroundColor: state.isSelected
                        ? '#752C84'
                        : state.isFocused
                          ? '#faf5ff'
                          : 'transparent',
                      color: state.isSelected ? '#ffffff' : state.isFocused ? '#752C84' : '#111827',
                      '&:hover': {
                        backgroundColor: state.isSelected ? '#752C84' : '#faf5ff',
                        color: state.isSelected ? '#ffffff' : '#752C84'
                      }
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
              !isSearchEnabled ? 'bg-[#7b4f84] cursor-not-allowed' : 'bg-primary cursor-pointer'
            }`}
            onClick={handleNewFilters}
            disabled={!isSearchEnabled}
          >
            <KeenIcon icon="magnifier" className="text-xl font-bold text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

export { Header };
