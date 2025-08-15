import { getLocalitiesByPostcode } from '@/services/api/all-services';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Autocomplete from 'react-google-autocomplete';
import { useDispatch } from 'react-redux';
import { setLocation } from '@/redux/slices/directory-slice';

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

interface AustralianSuburbSearchProps {
  defaultValue?: string;
}

export default function AustralianSuburbSearch({ defaultValue }: AustralianSuburbSearchProps) {
  const [suburbList, setSuburbList] = useState<Suburb[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(defaultValue || '');
  const debounceRef = useRef<NodeJS.Timeout>();
  const locationDebounceRef = useRef<NodeJS.Timeout>();
  const dispatch = useDispatch();

  // Update input value when defaultValue changes
  useEffect(() => {
    if (defaultValue) {
      setInputValue(defaultValue);
    }
  }, [defaultValue]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim().length > 0) {
      // User pressed Enter to select the typed suburb
      dispatch(setLocation(inputValue.trim()));
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
            if (place?.address_components) {
              // Find the suburb (locality) from address components
              const suburb = place.address_components.find((component: any) => 
                component.types.includes('locality') || component.types.includes('sublocality')
              );
              
              if (suburb) {
                const suburbName = suburb.long_name;
                setInputValue(suburbName);
                dispatch(setLocation(suburbName));
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
                        onChange={() => {
                          setSelected(suburb.name);
                          dispatch(setLocation(suburb.name));
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
