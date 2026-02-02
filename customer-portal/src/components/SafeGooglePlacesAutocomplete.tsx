import React from 'react';

const hasGoogleApiKey = !!import.meta.env.VITE_APP_GOOGLE_API_KEY;

/**
 * Wrapper around react-google-places-autocomplete that falls back to a
 * plain text input when no Google API key is configured, preventing the
 * app from crashing.
 */
const SafeGooglePlacesAutocomplete: React.FC<any> = (props) => {
  if (!hasGoogleApiKey) {
    const placeholder = props.selectProps?.placeholder || 'Search destinations...';
    return (
      <input
        type="text"
        placeholder={placeholder}
        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
        disabled
        title="Google Places API key not configured"
      />
    );
  }

  // Lazy import to avoid loading the Google script when there's no key
  const GooglePlacesAutocomplete = React.lazy(
    () => import('react-google-places-autocomplete')
  );

  return (
    <React.Suspense fallback={<input type="text" placeholder="Loading..." className="w-full text-sm border border-gray-300 rounded px-2 py-1" disabled />}>
      <GooglePlacesAutocomplete {...props} />
    </React.Suspense>
  );
};

export default SafeGooglePlacesAutocomplete;

// Re-export geocoding utils only when key is available
export const safeGeocodeByPlaceId = async (...args: any[]) => {
  if (!hasGoogleApiKey) return [];
  const { geocodeByPlaceId } = await import('react-google-places-autocomplete');
  return geocodeByPlaceId(...(args as [string]));
};

export const safeGeocodeByLatLng = async (...args: any[]) => {
  if (!hasGoogleApiKey) return [];
  const { geocodeByLatLng } = await import('react-google-places-autocomplete');
  return geocodeByLatLng(...(args as [google.maps.LatLngLiteral]));
};

export const safeGetLatLng = async (...args: any[]) => {
  if (!hasGoogleApiKey) return { lat: 0, lng: 0 };
  const { getLatLng } = await import('react-google-places-autocomplete');
  return getLatLng(...(args as [google.maps.GeocoderResult]));
};
