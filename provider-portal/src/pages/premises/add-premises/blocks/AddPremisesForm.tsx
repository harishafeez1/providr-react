import React, { useState, useRef, useEffect } from 'react';
import { Formik, Form, Field, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete';

import { KeenIcon } from '@/components';
import { createPremises } from '@/services/api';
import { useAuthContext } from '@/auth';
import { useNavigate } from 'react-router';
import PlacesAutocomplete from '@/components/google-places/placesAutocomplete';
import { Switch } from '@/components/ui/switch';
import { ProgressBar } from '@/pages/company-profile/add-company-profile/ProgressBar';

const FocusError = ({
  fieldRefs
}: {
  fieldRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>;
}) => {
  const { errors, touched, isSubmitting, isValidating } = useFormikContext();
  const [previousSubmittingState, setPreviousSubmittingState] = useState(false);

  useEffect(() => {
    // Focus on first error when submitting changes from false to true (each submit attempt)
    if (isSubmitting && !previousSubmittingState) {
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey && Object.keys(touched).length > 0) {
        setTimeout(() => {
          const targetElement = fieldRefs.current[firstErrorKey];
          if (targetElement) {
            // Handle regular input elements
            if (
              targetElement.tagName &&
              ['INPUT', 'TEXTAREA', 'SELECT'].includes(targetElement.tagName)
            ) {
              (targetElement as HTMLElement).focus();
            }
            // For div containers, find the first focusable element
            else if (targetElement.querySelector) {
              const focusableChild = targetElement.querySelector(
                'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
              );
              if (focusableChild && typeof (focusableChild as HTMLElement).focus === 'function') {
                (focusableChild as HTMLElement).focus();
              }
            }

            // Scroll the element into view
            if (targetElement.scrollIntoView) {
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }, 100);
      }
    }

    // Track previous submitting state
    setPreviousSubmittingState(isSubmitting);
  }, [errors, touched, isSubmitting, isValidating, fieldRefs, previousSubmittingState]);

  return null;
};

const AddPremisesForm = () => {
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const [selectedPlace, setSelectedPlace] = useState('');
  const [selectedLongitude, setSelectedLongitude] = useState<number | ''>();
  const [selectedLatitude, setSelectedLatitude] = useState<number | ''>();
  const [selectedSuburb, setSelectedSuburb] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedPostCode, setSelectedPostCode] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [selectedActive, setSelectedActive] = useState(true);
  const [selectedPhone, setSelectedPhone] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const fieldRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const premisesSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    active: Yup.boolean().required('active is required'),
    address_line_1: Yup.mixed().required('address is required')
  });

  const initialValues = {
    name: selectedName ? selectedName : '',
    active: selectedActive,
    // @ts-ignore
    address_line_1: selectedPlace ? selectedPlace?.value?.description : '',
    // address_line_2: '',
    suburb: selectedSuburb ? selectedSuburb : '',
    state: selectedState ? selectedState : '',
    post_code: selectedPostCode ? selectedPostCode : '',
    longitude: selectedLongitude ? selectedLongitude : '',
    latitude: selectedLatitude ? selectedLatitude : '',
    phone: selectedPhone ? selectedPhone : '',
    email: selectedEmail ? selectedEmail : ''
  };

  const handleSubmit = async (values: any, { resetForm, setFieldValue }: any) => {
    setLoading(true);
    const id = currentUser?.provider_company_id;
    const res = await createPremises({
      ...values,
      active: values.active ? '1' : '0', // Convert boolean to string for API
      provider_company_id: id
    });
    if (res) {
      resetForm();
      setFieldValue('active', false);
      setFieldValue('state', []);
      setLoading(false);
      navigate('/premises');
    }
  };

  const handlePlaceChange = async (address: any) => {
    setSelectedPlace(address);
    if (address) {
      const addressValue = await geocodeByAddress(address.label);
      const langLat = await getLatLng(addressValue[0]);
      const { lat, lng } = langLat;
      const longitude = lng ? lng : '';
      const latitude = lat ? lat : '';
      const addressComponents = addressValue[0].address_components;
      const postalCodeObj = addressComponents.find((component) =>
        component.types.includes('postal_code')
      );
      const postalCode = postalCodeObj ? postalCodeObj.long_name : '';
      const suburbObj = addressComponents.find((component) => component.types.includes('locality'));
      const suburb = suburbObj ? suburbObj.long_name : '';
      const stateObj = addressComponents.find((component) =>
        component.types.includes('administrative_area_level_1')
      );
      const state = stateObj ? stateObj.long_name : '';
      setSelectedPostCode(postalCode);
      setSelectedSuburb(suburb);
      setSelectedState(state);
      setSelectedLongitude(longitude);
      setSelectedLatitude(latitude);
    }
  };

  return (
    <>
      <Formik
        validationSchema={premisesSchema}
        initialValues={initialValues}
        enableReinitialize
        onSubmit={(formData, { resetForm, setFieldValue }) =>
          handleSubmit(formData, { resetForm, setFieldValue })
        }
      >
        {({ setFieldValue, values, isSubmitting, touched, errors }) => (
          <>
            <FocusError fieldRefs={fieldRefs} />
            <Form className="card p-4">
              <ProgressBar className="my-6" />
              <div className="grid gap-5">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active-mode"
                    name="active"
                    checked={values.active}
                    onCheckedChange={(checked: boolean) => {
                      setFieldValue('active', checked);
                      setSelectedActive(checked);
                    }}
                  />
                  <label htmlFor="active-mode" className="font-medium cursor-pointer">
                    Active
                  </label>
                </div>
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="user" className="text-sm" />
                    Premises Name
                  </label>
                  <Field
                    className="input"
                    name="name"
                    type="text"
                    placeholder="Sydney Clinic"
                    value={values.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('name', e.target.value);
                      setSelectedName(e.target.value);
                    }}
                    innerRef={(ref: HTMLInputElement) => {
                      fieldRefs.current['name'] = ref;
                    }}
                  />
                  {touched.name && errors.name && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {errors.name}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="geolocation" className="text-sm" />
                    Address
                  </label>
                  <Field name="address_line_1">
                    {({ field }: any) => (
                      <div
                        ref={(ref: HTMLDivElement) => {
                          fieldRefs.current['address_line_1'] = ref;
                        }}
                        className="w-full"
                      >
                        <PlacesAutocomplete
                          {...field}
                          name="address_line_1"
                          value={selectedPlace}
                          onChange={handlePlaceChange}
                        />
                      </div>
                    )}
                  </Field>
                  {touched.address_line_1 && errors.address_line_1 && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {errors.address_line_1}
                    </span>
                  )}
                </div>
                {/* <div className="flex items-baseline flex-wrap gap-2.5">
                <label className="form-label max-w-70 gap-1">
                  <KeenIcon icon="geolocation" className="text-sm" />
                  Address Line 2
                </label>
                <Field
                  className="input"
                  name="address_line_2"
                  type="text"
                  placeholder="Start typing street address..."
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldValue('address_line_2', e.target.value);
                  }}
                />
                {touched.address_line_2 && errors.address_line_2 && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {errors.address_line_2}
                  </span>
                )}
              </div> */}
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="map" className="text-sm" />
                    Suburb
                  </label>
                  <Field
                    className="input"
                    name="suburb"
                    type="text"
                    placeholder=""
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('suburb', e.target.value);
                    }}
                  />
                  {touched.suburb && errors.suburb && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {errors.suburb}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="map" className="text-sm" />
                    State
                  </label>
                  <Field
                    className="input"
                    name="state"
                    type="text"
                    placeholder=""
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('state', e.target.value);
                    }}
                  />
                  {touched.state && errors.state && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {errors.state}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="map" className="text-sm" />
                    Postal Code
                  </label>
                  <Field
                    className="input"
                    name="post_code"
                    type="text"
                    placeholder="Enter code"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('post_code', e.target.value);
                    }}
                  />
                  {touched.post_code && errors.post_code && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {errors.post_code}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="geolocation" className="text-sm" />
                    Longitude
                  </label>
                  <Field
                    className="input"
                    name="longitude"
                    type="text"
                    placeholder=""
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('longitude', e.target.value);
                    }}
                  />
                  {touched.longitude && errors.longitude && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {errors.longitude}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="geolocation" className="text-sm" />
                    Latitude
                  </label>
                  <Field
                    className="input"
                    name="latitude"
                    type="text"
                    placeholder=""
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('latitude', e.target.value);
                    }}
                  />
                  {touched.latitude && errors.latitude && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {errors.latitude}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="phone" className="text-sm" />
                    Phone Number
                  </label>
                  <Field
                    className="input"
                    name="phone"
                    type="number"
                    placeholder="Enter phone number"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('phone', e.target.value);
                      setSelectedPhone(e.target.value);
                    }}
                  />
                  {touched.phone && errors.phone && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {errors.phone}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <label className="form-label max-w-70 gap-1">
                    <KeenIcon icon="sms" className="text-sm" />
                    Email
                  </label>
                  <Field
                    className="input"
                    name="email"
                    type="email"
                    placeholder="example@abc.com"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('email', e.target.value);
                      setSelectedEmail(e.target.value);
                    }}
                  />
                  {touched.email && errors.email && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {errors.email}
                    </span>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn btn-primary flex justify-center"
                    disabled={loading || isSubmitting}
                  >
                    {loading ? 'Please wait...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </Form>
          </>
        )}
      </Formik>
    </>
  );
};

export { AddPremisesForm };
