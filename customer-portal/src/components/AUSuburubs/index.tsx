import { getLocalitiesByPostcode } from '@/services/api/all-services';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setServiceLocation } from '@/redux/slices/services-slice';

const hasGoogleApiKey = !!import.meta.env.VITE_APP_GOOGLE_API_KEY;

interface Suburb {
  name: string;
  state: string;
}

interface PlacePrediction {
  place_id: string;
  description: string;
}

async function fetchSuburbsByPostcode(postcode: string): Promise<Suburb[]> {
  const data = await getLocalitiesByPostcode(postcode);

  if (!data || !Array.isArray(data) || data.length === 0) return [];

  return data.map((item: any) => ({
    name: item.name,
    state: item.state
  }));
}

function useGoogleAutocomplete() {
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);

  const getService = useCallback(() => {
    if (!serviceRef.current && window.google?.maps?.places) {
      serviceRef.current = new window.google.maps.places.AutocompleteService();
    }
    return serviceRef.current;
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    const service = getService();
    if (!service || input.length < 2) {
      setPredictions([]);
      return;
    }

    service.getPlacePredictions(
      {
        input,
        types: ['(regions)'],
        componentRestrictions: { country: 'au' },
        language: 'en',
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results.map((r) => ({ place_id: r.place_id, description: r.description })));
        } else {
          setPredictions([]);
        }
      }
    );
  }, [getService]);

  const clearPredictions = useCallback(() => setPredictions([]), []);

  return { predictions, fetchPredictions, clearPredictions };
}

async function geocodeAndExtract(placeId: string): Promise<{
  suburb: string; state: string; lat: number; lng: number;
} | null> {
  if (!window.google?.maps) return null;
  const geocoder = new window.google.maps.Geocoder();
  return new Promise((resolve) => {
    geocoder.geocode({ placeId }, (results, status) => {
      if (status !== 'OK' || !results?.[0]) { resolve(null); return; }
      const result = results[0];
      const locality = result.address_components.find(
        (c) => c.types.includes('locality') || c.types.includes('sublocality')
      );
      const stateComp = result.address_components.find(
        (c) => c.types.includes('administrative_area_level_1')
      );
      const loc = result.geometry?.location;
      resolve({
        suburb: locality?.long_name || result.formatted_address,
        state: stateComp?.short_name || '',
        lat: loc ? loc.lat() : 0,
        lng: loc ? loc.lng() : 0,
      });
    });
  });
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!window.google?.maps) return null;
  const geocoder = new window.google.maps.Geocoder();
  return new Promise((resolve) => {
    geocoder.geocode({ address: `${address}, Australia` }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        resolve({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        });
      } else {
        resolve(null);
      }
    });
  });
}

export default function AustralianSuburbSearch() {
  const [suburbList, setSuburbList] = useState<Suburb[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [isRadioSelection, setIsRadioSelection] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const predictionDebounceRef = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { predictions, fetchPredictions, clearPredictions } = useGoogleAutocomplete();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    if (isRadioSelection) {
      setIsRadioSelection(false);
      return;
    }

    const value = e.target.value.trim();
    setInputValue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (predictionDebounceRef.current) clearTimeout(predictionDebounceRef.current);

    if (/^\d{4}$/.test(value)) {
      clearPredictions();
      setShowDropdown(false);
      debounceRef.current = setTimeout(() => {
        debouncedFetch(value);
      }, 500);
    } else if (hasGoogleApiKey && value.length >= 2) {
      setSuburbList([]);
      setSelected('');
      setIsLoading(false);
      predictionDebounceRef.current = setTimeout(() => {
        fetchPredictions(value);
        setShowDropdown(true);
      }, 300);
    } else {
      setSuburbList([]);
      setSelected('');
      setIsLoading(false);
      clearPredictions();
      setShowDropdown(false);
    }
  };

  const handleSelectPrediction = async (prediction: PlacePrediction) => {
    setShowDropdown(false);
    clearPredictions();

    const result = await geocodeAndExtract(prediction.place_id);
    if (result) {
      const displayValue = result.state ? `${result.suburb} ${result.state}` : result.suburb;
      setInputValue(displayValue);
      setIsRadioSelection(true);
      dispatch(setServiceLocation({
        address: result.suburb,
        city: result.suburb,
        state: result.state,
        country: 'Australia',
        latitude: result.lat.toString(),
        longitude: result.lng.toString(),
      }));
    } else {
      setInputValue(prediction.description);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim().length > 0) {
      setShowDropdown(false);
      clearPredictions();
      const locationName = inputValue.trim();

      const coords = await geocodeAddress(locationName);
      dispatch(setServiceLocation({
        address: locationName,
        city: locationName,
        state: '',
        country: 'Australia',
        ...(coords ? { latitude: coords.lat.toString(), longitude: coords.lng.toString() } : {}),
      }));
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

  const inputClasses = 'w-full border-2 border-primary py-2 ps-2 pe-10 rounded-md outline-none focus:border-primary active:border-primary mb-6';

  return (
    <>
      <div className="relative" ref={wrapperRef}>
        <input
          type="text"
          placeholder="Type suburb or postcode..."
          className={inputClasses}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          value={inputValue}
          onFocus={() => { if (predictions.length > 0) setShowDropdown(true); }}
        />

        {/* Google Places predictions dropdown */}
        {showDropdown && predictions.length > 0 && (
          <div className="absolute z-50 left-0 right-0 top-[calc(100%-1.5rem)] bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {predictions.map((p) => (
              <button
                key={p.place_id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-b border-gray-50 last:border-b-0"
                onClick={() => handleSelectPrediction(p)}
              >
                {p.description}
              </button>
            ))}
          </div>
        )}

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

                          const coords = await geocodeAddress(`${suburb.name}, ${suburb.state}`);
                          dispatch(setServiceLocation({
                            address: suburb.name,
                            city: suburb.name,
                            state: suburb.state,
                            country: 'Australia',
                            ...(coords ? { latitude: coords.lat.toString(), longitude: coords.lng.toString() } : {}),
                          }));
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
