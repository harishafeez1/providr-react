import React from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

interface PlacesAutocompleteProps {
  value: any;
  onChange: (value: any) => void;
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({ value, onChange }) => {
  return (
    <>
      <GooglePlacesAutocomplete
        apiKey={import.meta.env.VITE_APP_GOOGLE_API_KEY || ''}
        onLoadFailed={(err) => {
          console.error('Could not load google places autocomplete', err);
        }}
        autocompletionRequest={{
          componentRestrictions: {
            country: 'aus'
          }
        }}
        selectProps={{
          isClearable: true,
          placeholder: 'Search for a places',
          value: value,
          onChange: onChange,
          styles: {
            container: (provided) => ({
              ...provided,
              width: '100%'
            }),
            control: (provided) => ({
              ...provided,
              fontSize: '13px'
            }),
            option: (provided) => ({
              ...provided,
              fontSize: '13px'
            })
          }
        }}
      />
    </>
  );
};

export default PlacesAutocomplete;
