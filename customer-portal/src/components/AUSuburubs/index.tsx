import { getLocalitiesByPostcode } from '@/services/api/all-services';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Autocomplete from 'react-google-autocomplete';
import { useDispatch } from 'react-redux';
import { setServiceLocation } from '@/redux/slices/services-slice';

interface Suburb {
  name: string;
  state: string;
}

async function fetchSuburbsByPostcode(postcode: string): Promise<Suburb[]> {
  const data = await getLocalitiesByPostcode(postcode);

  if (!data || !Array.isArray(data) || data.length === 0) return [];

  return data.map((item: any) => ({
    name: item.name,
    state: item.state
  }));
}

export default function AustralianSuburbSearch() {
  const [suburbList, setSuburbList] = useState<Suburb[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [isRadioSelection, setIsRadioSelection] = useState<boolean>(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const locationDebounceRef = useRef<NodeJS.Timeout>();
  const dispatch = useDispatch();

  const debouncedFetch = useCallback(async (postcode: string) => {
    setIsLoading(true);
    try {
      const suburbs = await fetchSuburbsByPostcode(postcode);
      setSuburbList(suburbs);
      setSelected('');
    } catch (error) {
      console.error('Error fetching suburbs:', error);
      setSuburbList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Skip handling if this is from a radio selection
    if (isRadioSelection) {
      setIsRadioSelection(false);
      return;
    }

    const value = e.target.value.trim();
    setInputValue(value);

    // Clear existing timeouts
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (locationDebounceRef.current) {
      clearTimeout(locationDebounceRef.current);
    }

    if (/^\d{4}$/.test(value)) {
      // Debounce the API call by 500ms for postcodes
      debounceRef.current = setTimeout(() => {
        debouncedFetch(value);
      }, 500);
    } else {
      // For suburb names, just clear the suburb list but don't set location yet
      setSuburbList([]);
      setSelected('');
      setIsLoading(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim().length > 0) {
      // User pressed Enter to select the typed suburb
      const locationName = inputValue.trim();
      
      try {
        const geocoder = new window.google.maps.Geocoder();
        const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode(
            { address: `${locationName}, Australia` },
            (results, status) => {
              if (status === 'OK' && results) {
                resolve(results);
              } else {
                reject(new Error('Geocoding failed'));
              }
            }
          );
        });
        
        if (result?.[0]?.geometry?.location) {
          const lat = result[0].geometry.location.lat();
          const lng = result[0].geometry.location.lng();
          
          dispatch(setServiceLocation({
            address: locationName,
            city: locationName,
            state: '',
            country: 'Australia',
            latitude: lat.toString(),
            longitude: lng.toString()
          }));
        } else {
          // Fallback without coordinates
          dispatch(setServiceLocation({
            address: locationName,
            city: locationName,
            state: '',
            country: 'Australia'
          }));
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        // Fallback without coordinates
        dispatch(setServiceLocation({
          address: locationName,
          city: locationName,
          state: '',
          country: 'Australia'
        }));
      }
    }
  };

  // Group suburbs by state
  const groupedByState = suburbList.reduce(
    (acc, suburb) => {
      if (!acc[suburb.state]) acc[suburb.state] = [];
      acc[suburb.state].push(suburb);
      return acc;
    },
    {} as Record<string, Suburb[]>
  );

  return (
    <>
      <div className="relative">
        <Autocomplete
          apiKey={import.meta.env.VITE_APP_GOOGLE_API_KEY}
          onPlaceSelected={(place) => {
            if (place?.address_components && place?.geometry?.location) {
              // Find the suburb (locality) and state from address components
              const suburb = place.address_components.find(
                (component: any) =>
                  component.types.includes('locality') || component.types.includes('sublocality')
              );
              
              const state = place.address_components.find(
                (component: any) =>
                  component.types.includes('administrative_area_level_1')
              );

              if (suburb) {
                const suburbName = suburb.long_name;
                const stateName = state ? state.short_name : '';
                const displayValue = stateName ? `${suburbName} ${stateName}` : suburbName;
                
                // Get coordinates from the place
                const latitude = place.geometry.location.lat();
                const longitude = place.geometry.location.lng();
                
                setInputValue(displayValue);
                dispatch(setServiceLocation({
                  address: suburbName,
                  city: suburbName,
                  state: stateName,
                  country: 'Australia',
                  latitude: latitude.toString(),
                  longitude: longitude.toString()
                }));
              }
            }
          }}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          value={inputValue}
          options={{
            types: ['(regions)'],
            componentRestrictions: { country: 'au' }
          }}
          apiOptions={{
            language: 'en',
            region: 'AU'
          }}
          debounce={0}
          placeholder="Type suburb or postcode..."
          className="w-full border-2 border-primary py-2 ps-2 pe-10 rounded-md outline-none focus:border-primary active:border-primary mb-6"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
            <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
            <div
              className="w-1 h-1 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-1 h-1 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        )}
      </div>

      {isLoading && <div className="text-sm text-gray-500 mb-4">Loading suburbs...</div>}

      {Object.keys(groupedByState).length > 0 && (
        <>
          <div className="font-semibold">Available Localities</div>
          <div style={{ border: '1px solid #ccc', padding: '8px', marginTop: '8px' }}>
            {Object.entries(groupedByState).map(([state, suburbs]) => (
              <div key={state}>
                <strong>{state}</strong>
                <div className="grid grid-cols-3 gap-3">
                  {suburbs.map((suburb) => (
                    <label key={suburb.name} className="flex gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="suburb"
                        className="accent-primary focus:ring-primary focus:outline-none "
                        checked={selected === suburb.name}
                        onChange={async () => {
                          setSelected(suburb.name);
                          setIsRadioSelection(true);
                          setInputValue(`${suburb.name} ${suburb.state}`);
                          
                          // Geocode the suburb to get coordinates
                          try {
                            const geocoder = new window.google.maps.Geocoder();
                            const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
                              geocoder.geocode(
                                { address: `${suburb.name}, ${suburb.state}, Australia` },
                                (results, status) => {
                                  if (status === 'OK' && results) {
                                    resolve(results);
                                  } else {
                                    reject(new Error('Geocoding failed'));
                                  }
                                }
                              );
                            });
                            
                            if (result?.[0]?.geometry?.location) {
                              const lat = result[0].geometry.location.lat();
                              const lng = result[0].geometry.location.lng();
                              
                              dispatch(setServiceLocation({
                                address: suburb.name,
                                city: suburb.name,
                                state: suburb.state,
                                country: 'Australia',
                                latitude: lat.toString(),
                                longitude: lng.toString()
                              }));
                            } else {
                              // Fallback without coordinates
                              dispatch(setServiceLocation({
                                address: suburb.name,
                                city: suburb.name,
                                state: suburb.state,
                                country: 'Australia'
                              }));
                            }
                          } catch (error) {
                            console.error('Geocoding error:', error);
                            // Fallback without coordinates
                            dispatch(setServiceLocation({
                              address: suburb.name,
                              city: suburb.name,
                              state: suburb.state,
                              country: 'Australia'
                            }));
                          }
                        }}
                      />
                      {suburb.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
