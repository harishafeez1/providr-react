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
          placeholder: 'Start typing street address...',
          value: value,
          defaultInputValue: value,
          onChange: onChange,
          styles: {
            container: (provided) => ({
              ...provided,
              width: '100%'
            }),
            control: (provided, state) => ({
              ...provided,
              fontSize: '13px',
              borderColor: state.isFocused ? '#752C84' : '#d1d5db',
              borderWidth: '1px',
              boxShadow: state.isFocused ? '0 0 0 1px #752C84' : 'none',
              '&:hover': {
                borderColor: state.isFocused ? '#752C84' : '#9ca3af'
              },
              minHeight: '2.5rem'
            }),
            option: (provided, state) => ({
              ...provided,
              fontSize: '13px',
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
            menu: (provided) => ({
              ...provided,
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              zIndex: 50
            }),
            menuList: (provided) => ({
              ...provided,
              padding: '0.25rem 0'
            })
          }
        }}
      />
    </>
  );
};

export default PlacesAutocomplete;
